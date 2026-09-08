import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export interface StoredOrderItem {
  id: string;
  orderId?: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  quantity: number;
  price: number;
  product?: {
    id?: string;
    name: string;
    images: string[];
    slug?: string;
  };
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  email?: string | null;
  division: string;
  district: string;
  area: string;
  address: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  orderStatus:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  courierTrackingId?: string | null;
  courierStatus?: string | null;
  note?: string | null;
  deviceInfo?: {
    source?: string;
    fingerprint?: string;
    ipAddress?: string;
    device?: string;
    totalVisits?: number;
    activeTime?: string;
    avgLoad?: string;
    firstVisit?: string;
    isBanned?: boolean;
  } | null;
  items: StoredOrderItem[];
  createdAt: string;
  updatedAt: string;
}

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");

function ensureOrdersFile() {
  const dir = path.dirname(ORDERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readOrdersFromFile(): StoredOrder[] {
  try {
    ensureOrdersFile();
    const data = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(data) || [];
  } catch (err) {
    console.warn("Could not read orders from JSON fallback:", err);
    return [];
  }
}

function writeOrdersToFile(orders: StoredOrder[]) {
  try {
    ensureOrdersFile();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write orders to JSON fallback:", err);
  }
}

/**
 * Save order with dual-resilience: tries Prisma first; if database is offline or product foreign key fails,
 * safely saves to local file store so order confirmation NEVER fails for the customer!
 */
export async function saveResilientOrder(orderData: {
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  email?: string | null;
  division?: string;
  district?: string;
  area?: string;
  address: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
  note?: string | null;
  deviceInfo?: any;
  items: Array<{
    productId: string;
    variantId?: string | null;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}): Promise<StoredOrder> {
  const nowIso = new Date().toISOString();
  const orderId = `ord_cuid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const division = orderData.division || "Dhaka";
  const district = orderData.district || "Dhaka";
  const area = orderData.area || "Inside BD";

  const fallbackOrder: StoredOrder = {
    id: orderId,
    orderNumber: orderData.orderNumber,
    userId: orderData.userId || null,
    customerName: orderData.customerName,
    phone: orderData.phone,
    email: orderData.email || null,
    division,
    district,
    area,
    address: orderData.address,
    subtotal: orderData.subtotal,
    discount: orderData.discount,
    shippingCharge: orderData.shippingCharge,
    total: orderData.total,
    paymentMethod: orderData.paymentMethod,
    paymentStatus: "PENDING",
    orderStatus: "PENDING",
    courierTrackingId: null,
    courierStatus: null,
    note: orderData.note || null,
    deviceInfo: orderData.deviceInfo || null,
    items: orderData.items.map((item, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      orderId,
      productId: item.productId,
      variantId: item.variantId || null,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      product: {
        id: item.productId,
        name: item.name,
        images: item.image ? [item.image] : ["/placeholder.png"],
        slug: item.productId,
      },
    })),
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Try saving to Prisma if DB is available
  try {
    // Check if products exist in DB before linking to avoid FK constraint errors
    for (const it of orderData.items) {
      try {
        const prod = await prisma.product.findUnique({ where: { id: it.productId } });
        if (!prod) {
          // Find or create default category
          let cat = await prisma.category.findFirst();
          if (!cat) {
            cat = await prisma.category.create({
              data: { name: "General", slug: "general" },
            });
          }
          await prisma.product.create({
            data: {
              id: it.productId,
              name: it.name,
              slug: `${it.productId}-${Date.now()}`,
              description: it.name,
              images: it.image ? [it.image] : ["/placeholder.png"],
              basePrice: it.price,
              sku: `SKU-${it.productId}`,
              stock: 999,
              categoryId: cat.id,
            },
          });
        }
      } catch (e) {
        // DB might be down, ignore product sync
      }
    }

    const dbOrder = await prisma.order.create({
      data: {
        orderNumber: orderData.orderNumber,
        userId: orderData.userId || null,
        customerName: orderData.customerName,
        phone: orderData.phone,
        email: orderData.email || null,
        division,
        district,
        area,
        address: orderData.address,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        shippingCharge: orderData.shippingCharge,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        note: orderData.note || null,
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, slug: true } },
          },
        },
      },
    });

    // Also persist in local backup
    const fileOrders = readOrdersFromFile();
    fileOrders.unshift({
      ...fallbackOrder,
      id: dbOrder.id,
      items: dbOrder.items.map((it) => ({
        id: it.id,
        orderId: dbOrder.id,
        productId: it.productId,
        variantId: it.variantId,
        productName: it.productName,
        quantity: it.quantity,
        price: Number(it.price),
        product: it.product,
      })),
    });
    writeOrdersToFile(fileOrders.slice(0, 100));

    return {
      ...fallbackOrder,
      id: dbOrder.id,
      items: dbOrder.items.map((it) => ({
        id: it.id,
        orderId: dbOrder.id,
        productId: it.productId,
        variantId: it.variantId,
        productName: it.productName,
        quantity: it.quantity,
        price: Number(it.price),
        product: it.product,
      })),
    };
  } catch (dbErr) {
    console.warn("Prisma DB order create fallback to file store:", dbErr);
    // Database unreachable - save to file storage
    const fileOrders = readOrdersFromFile();
    fileOrders.unshift(fallbackOrder);
    writeOrdersToFile(fileOrders.slice(0, 100));
    return fallbackOrder;
  }
}

/**
 * Retrieve an order by ID or orderNumber, checking DB first then file fallback
 */
export async function getResilientOrder(idOrNumber: string): Promise<StoredOrder | null> {
  try {
    const dbOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { orderNumber: idOrNumber },
          { courierTrackingId: idOrNumber },
        ],
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, slug: true } },
          },
        },
      },
    });

    if (dbOrder) {
      return {
        id: dbOrder.id,
        orderNumber: dbOrder.orderNumber,
        userId: dbOrder.userId,
        customerName: dbOrder.customerName,
        phone: dbOrder.phone,
        email: dbOrder.email,
        division: dbOrder.division,
        district: dbOrder.district,
        area: dbOrder.area,
        address: dbOrder.address,
        subtotal: Number(dbOrder.subtotal),
        discount: Number(dbOrder.discount),
        shippingCharge: Number(dbOrder.shippingCharge),
        total: Number(dbOrder.total),
        paymentMethod: dbOrder.paymentMethod,
        paymentStatus: dbOrder.paymentStatus as any,
        orderStatus: dbOrder.orderStatus as any,
        courierTrackingId: dbOrder.courierTrackingId,
        courierStatus: dbOrder.courierStatus,
        note: dbOrder.note,
        items: dbOrder.items.map((it) => ({
          id: it.id,
          orderId: dbOrder.id,
          productId: it.productId,
          variantId: it.variantId,
          productName: it.productName,
          quantity: it.quantity,
          price: Number(it.price),
          product: it.product,
        })),
        createdAt: dbOrder.createdAt.toISOString(),
        updatedAt: dbOrder.updatedAt.toISOString(),
      };
    }
  } catch (err) {
    // DB offline, fall through to file store
  }

  // File fallback
  const fileOrders = readOrdersFromFile();
  const match = fileOrders.find(
    (o) =>
      o.id === idOrNumber ||
      o.orderNumber === idOrNumber ||
      o.courierTrackingId === idOrNumber
  );
  return match || null;
}

/**
 * Retrieve all orders, merging DB and file store
 */
export async function getResilientOrders(filter?: {
  status?: string;
  search?: string;
  userId?: string;
}): Promise<StoredOrder[]> {
  let dbOrders: StoredOrder[] = [];

  try {
    const where: any = {};
    if (filter?.userId) where.userId = filter.userId;
    if (filter?.status && filter.status !== "ALL") where.orderStatus = filter.status;
    if (filter?.search) {
      where.OR = [
        { orderNumber: { contains: filter.search, mode: "insensitive" } },
        { customerName: { contains: filter.search, mode: "insensitive" } },
        { phone: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const fetched = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    dbOrders = fetched.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      customerName: o.customerName,
      phone: o.phone,
      email: o.email,
      division: o.division,
      district: o.district,
      area: o.area,
      address: o.address,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shippingCharge: Number(o.shippingCharge),
      total: Number(o.total),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus as any,
      orderStatus: o.orderStatus as any,
      courierTrackingId: o.courierTrackingId,
      courierStatus: o.courierStatus,
      note: o.note,
      items: o.items.map((it) => ({
        id: it.id,
        orderId: o.id,
        productId: it.productId,
        variantId: it.variantId,
        productName: it.productName,
        quantity: it.quantity,
        price: Number(it.price),
        product: it.product,
      })),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  } catch (err) {
    // DB offline, fall through to file store
  }

  // Combine with file store, avoiding duplicates
  const fileOrders = readOrdersFromFile();
  const dbOrderNumbers = new Set(dbOrders.map((o) => o.orderNumber));
  const uniqueFileOrders = fileOrders.filter((o) => !dbOrderNumbers.has(o.orderNumber));

  let combined = [...dbOrders, ...uniqueFileOrders];

  if (filter?.status && filter.status !== "ALL") {
    combined = combined.filter((o) => o.orderStatus === filter.status);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    combined = combined.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)
    );
  }

  combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return combined;
}

/**
 * Update an order's status or courier info
 */
export async function updateResilientOrder(
  id: string,
  data: Partial<StoredOrder>
): Promise<StoredOrder | null> {
  let updatedOrder: StoredOrder | null = null;

  try {
    const updateData: any = {};
    if (data.customerName !== undefined) updateData.customerName = data.customerName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.shippingCharge !== undefined) updateData.shippingCharge = data.shippingCharge;
    if (data.total !== undefined) updateData.total = data.total;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.deviceInfo !== undefined) updateData.deviceInfo = data.deviceInfo;
    if (data.orderStatus !== undefined) updateData.orderStatus = data.orderStatus as any;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus as any;
    if (data.courierTrackingId !== undefined) updateData.courierTrackingId = data.courierTrackingId;
    if (data.courierStatus !== undefined) updateData.courierStatus = data.courierStatus;

    const dbUpdated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, slug: true } },
          },
        },
      },
    });

    if (dbUpdated) {
      updatedOrder = {
        id: dbUpdated.id,
        orderNumber: dbUpdated.orderNumber,
        userId: dbUpdated.userId,
        customerName: dbUpdated.customerName,
        phone: dbUpdated.phone,
        email: dbUpdated.email,
        division: dbUpdated.division,
        district: dbUpdated.district,
        area: dbUpdated.area,
        address: dbUpdated.address,
        subtotal: Number(dbUpdated.subtotal),
        discount: Number(dbUpdated.discount),
        shippingCharge: Number(dbUpdated.shippingCharge),
        total: Number(dbUpdated.total),
        paymentMethod: dbUpdated.paymentMethod,
        paymentStatus: dbUpdated.paymentStatus as any,
        orderStatus: dbUpdated.orderStatus as any,
        courierTrackingId: dbUpdated.courierTrackingId,
        courierStatus: dbUpdated.courierStatus,
        note: dbUpdated.note,
        items: dbUpdated.items.map((it) => ({
          id: it.id,
          orderId: dbUpdated.id,
          productId: it.productId,
          variantId: it.variantId,
          productName: it.productName,
          quantity: it.quantity,
          price: Number(it.price),
          product: it.product,
        })),
        createdAt: dbUpdated.createdAt.toISOString(),
        updatedAt: dbUpdated.updatedAt.toISOString(),
      };
    }
  } catch (err) {
    // DB offline, fall through to update in file
  }

  // Always update in file store as well
  const fileOrders = readOrdersFromFile();
  const idx = fileOrders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (idx !== -1) {
    fileOrders[idx] = {
      ...fileOrders[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeOrdersToFile(fileOrders);
    if (!updatedOrder) {
      updatedOrder = fileOrders[idx];
    }
  }

  return updatedOrder;
}
