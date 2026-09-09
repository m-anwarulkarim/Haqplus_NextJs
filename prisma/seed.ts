import { PrismaClient, Role, CouponType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding haqplus Tea Database...");

  const adminPassword = await bcrypt.hash("admin123456", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);
  const anwarulPassword = await bcrypt.hash("dev.anwarul", 10);

  // 1. Create Admin & Customer Users
  await prisma.user.upsert({
    where: { email: "admin@haqplus.com" },
    update: {
      role: Role.ADMIN,
      password: adminPassword,
    },
    create: {
      name: "haqplus Administrator",
      email: "admin@haqplus.com",
      phone: "+8801711000001",
      password: adminPassword,
      role: Role.ADMIN,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.user.upsert({
    where: { email: "dev.anwarul@gmail.com" },
    update: {
      role: Role.ADMIN,
      password: anwarulPassword,
      name: "Anwarul Karim",
    },
    create: {
      name: "Anwarul Karim",
      email: "dev.anwarul@gmail.com",
      phone: "+8801700000000",
      password: anwarulPassword,
      role: Role.ADMIN,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "customer@haqplus.com" },
    update: {
      password: customerPassword,
    },
    create: {
      name: "Tanzim Ahmed",
      email: "customer@haqplus.com",
      phone: "+8801822000002",
      password: customerPassword,
      role: Role.CUSTOMER,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("👤 Users seeded (Admin: admin@haqplus.com, dev.anwarul@gmail.com)");

  // 2. Create Tea Categories
  const blackTeaCat = await prisma.category.upsert({
    where: { slug: "black-tea" },
    update: {
      name: "Black Tea (ব্ল্যাক টি)",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    },
    create: {
      name: "Black Tea (ব্ল্যাক টি)",
      slug: "black-tea",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    },
  });

  const greenTeaCat = await prisma.category.upsert({
    where: { slug: "green-tea" },
    update: {
      name: "Green Tea (গ্রিন টি)",
      image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=80",
    },
    create: {
      name: "Green Tea (গ্রিন টি)",
      slug: "green-tea",
      image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=80",
    },
  });

  const masalaChaiCat = await prisma.category.upsert({
    where: { slug: "masala-chai" },
    update: {
      name: "Masala Chai (রয়েল মসলা চা)",
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80",
    },
    create: {
      name: "Masala Chai (রয়েল মসলা চা)",
      slug: "masala-chai",
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80",
    },
  });

  const herbalTeaCat = await prisma.category.upsert({
    where: { slug: "herbal-tea" },
    update: {
      name: "Herbal & Wellness Tea (ভেষজ চা)",
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&auto=format&fit=crop&q=80",
    },
    create: {
      name: "Herbal & Wellness Tea (ভেষজ চা)",
      slug: "herbal-tea",
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&auto=format&fit=crop&q=80",
    },
  });

  console.log("📂 Tea Categories seeded");

  // 3. Create Authentic Tea Products
  const teaProductsData = [
    {
      name: "HaqPlus শ্রীমঙ্গল প্রিমিয়াম সিটিসি ব্ল্যাক টি (400g)",
      slug: "haqplus-sreemangal-ctc-black-tea-400g",
      description:
        "শ্রীমঙ্গলের ঐতিহ্যবাহী চা বাগান থেকে বাছাইকৃত তাজা দুটি পাতা একটি কুঁড়ি দিয়ে আধুনিক সিটিসি পদ্ধতিতে তৈরি। কড়া লালচে লিকার ও সতেজ সুবাসের সেরা ব্ল্যাক টি।",
      images: [
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
      ],
      basePrice: 320,
      discountPrice: 280,
      sku: "HAQ-CTC-400",
      stock: 95,
      categoryId: blackTeaCat.id,
      isFeatured: true,
      isActive: true,
      metaTitle: "HaqPlus শ্রীমঙ্গল প্রিমিয়াম সিটিসি ব্ল্যাক টি — 400g Pack",
      metaDescription: "শ্রীমঙ্গলের সেরা বাগানের কড়া লিকারের প্রিমিয়াম ব্ল্যাক টি কিনুন হকপ্লাস থেকে।",
      variants: [
        { size: "400g", price: 280, stock: 95, sku: "HAQ-CTC-400" },
      ],
    },
    {
      name: "HaqPlus অর্গানিক ফার্স্ট ফ্লাশ গ্রিন টি (200g)",
      slug: "haqplus-organic-first-flush-green-tea-200g",
      description:
        "১০০% প্রাকৃতিক ও রাসায়নিকমুক্ত কচি চা পাতার ফার্স্ট ফ্লাশ গ্রিন টি। অ্যান্টিঅক্সিডেন্ট ও ক্যাটেচিনে ভরপুর যা মেটাবলিজম ও সুস্বাস্থ্যের জন্য আদর্শ।",
      images: [
        "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&auto=format&fit=crop&q=80",
      ],
      basePrice: 450,
      discountPrice: 390,
      sku: "HAQ-GRN-200",
      stock: 75,
      categoryId: greenTeaCat.id,
      isFeatured: true,
      isActive: true,
      metaTitle: "HaqPlus অর্গানিক ফার্স্ট ফ্লাশ গ্রিন টি — 200g Pack",
      metaDescription: "প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ অর্গানিক গ্রিন টি কিনুন হকপ্লাস থেকে।",
      variants: [
        { size: "200g", price: 390, stock: 75, sku: "HAQ-GRN-200" },
      ],
    },
    {
      name: "HaqPlus স্পেশাল রয়েল মসলা চা ব্লেন্ড (250g)",
      slug: "haqplus-royal-masala-chai-blend-250g",
      description:
        "খাঁটি এলাচ, লবঙ্গ, দারুচিনি, তেজপাতা, গোলমরিচ ও শুকনো আদার সাথে সিলেটের কড়া ব্ল্যাক টি-এর প্রিমিয়াম সুগন্ধি মসলা চা মিশ্রণ।",
      images: [
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&auto=format&fit=crop&q=80",
      ],
      basePrice: 390,
      discountPrice: 340,
      sku: "HAQ-MSL-250",
      stock: 64,
      categoryId: masalaChaiCat.id,
      isFeatured: true,
      isActive: true,
      metaTitle: "HaqPlus রয়েল মসলা চা — 250g Blend",
      metaDescription: "আসল এলাচ ও দারুচিনি মিশ্রিত রাজকীয় মসলা চা কিনুন হকপ্লাস থেকে।",
      variants: [
        { size: "250g", price: 340, stock: 64, sku: "HAQ-MSL-250" },
      ],
    },
    {
      name: "HaqPlus সিলেট অর্থোডক্স গোল্ডেন টিপ টি (150g)",
      slug: "haqplus-sylhet-orthodox-golden-tip-tea-150g",
      description:
        "হাতে বাছাই করা সোনালী কুঁড়ি (Golden Tips) সমৃদ্ধ অর্থোডক্স চা। অতুলনীয় মধুর সুবাস এবং লালচে সোনালী লিকারের আভিজাত্য।",
      images: [
        "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
      ],
      basePrice: 580,
      discountPrice: 520,
      sku: "HAQ-GLD-150",
      stock: 40,
      categoryId: blackTeaCat.id,
      isFeatured: true,
      isActive: true,
      metaTitle: "HaqPlus সিলেট অর্থোডক্স গোল্ডেন টি — 150g Leaf",
      metaDescription: "সোনালী কুঁড়ির খাঁটি অর্থোডক্স ব্ল্যাক টি কিনুন হকপ্লাস থেকে।",
      variants: [
        { size: "150g", price: 520, stock: 40, sku: "HAQ-GLD-150" },
      ],
    },
    {
      name: "HaqPlus তুলসি আদা ভেষজ ওয়েলনেস টি (100g)",
      slug: "haqplus-tulsi-ginger-herbal-tea-100g",
      description:
        "প্রাকৃতিক তুলসি পাতা ও আদার উপকারি গুণে ঠাণ্ডা, কাশি ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধির জন্য বিশেষ ভেষজ চা।",
      images: [
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&auto=format&fit=crop&q=80",
      ],
      basePrice: 300,
      discountPrice: 260,
      sku: "HAQ-TLS-100",
      stock: 50,
      categoryId: herbalTeaCat.id,
      isFeatured: true,
      isActive: true,
      metaTitle: "HaqPlus তুলসি আদা ভেষজ চা — 100g Herbal Wellness",
      metaDescription: "ঠাণ্ডা-কাশি উপশমে তুলসি-আদা ভেষজ চা কিনুন হকপ্লাস থেকে।",
      variants: [
        { size: "100g", price: 260, stock: 50, sku: "HAQ-TLS-100" },
      ],
    },
    {
      name: "HaqPlus জেসমিন ব্লসম গ্রিন টি (150g)",
      slug: "haqplus-jasmine-blossom-green-tea-150g",
      description:
        "তাজা জুঁই ফুলের প্রাকৃতিক নির্যাস মাখানো ফার্স্ট গ্রেড গ্রিন টি। মিষ্টি মন মাতানো সুবাস ও ক্লান্তি দূরকারী সতেজতা।",
      images: [
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=80",
      ],
      basePrice: 500,
      discountPrice: 450,
      sku: "HAQ-JSM-150",
      stock: 35,
      categoryId: greenTeaCat.id,
      isFeatured: true,
      isActive: true,
      metaTitle: "HaqPlus জেসমিন ব্লসম গ্রিন টি — 150g Flower Blend",
      metaDescription: "জুঁই ফুলের মিষ্টি সুবাসে তৈরি ফ্রেশ জেসমিন গ্রিন টি কিনুন হকপ্লাস থেকে।",
      variants: [
        { size: "150g", price: 450, stock: 35, sku: "HAQ-JSM-150" },
      ],
    },
  ];

  for (const prod of teaProductsData) {
    const { variants, ...prodData } = prod;
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        ...prodData,
      },
      create: {
        ...prodData,
        variants: {
          create: variants.map((v) => ({
            size: v.size || null,
            color: null,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
          })),
        },
      },
    });
  }

  console.log("🛍️ Tea Products and Variants seeded");

  // 4. Seed Coupons
  const coupons = [
    {
      code: "WELCOME20",
      type: CouponType.PERCENTAGE,
      value: 20,
      minPurchase: 500,
      isActive: true,
    },
    {
      code: "CHAI10",
      type: CouponType.PERCENTAGE,
      value: 10,
      minPurchase: 300,
      isActive: true,
    },
    {
      code: "FREESHIP",
      type: CouponType.FIXED,
      value: 70,
      minPurchase: 1000,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  console.log("🎟️ Coupons seeded (WELCOME20, CHAI10, FREESHIP)");
  console.log("✅ haqplus Tea database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
