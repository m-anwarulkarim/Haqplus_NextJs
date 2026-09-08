import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন (কমপক্ষে ২ অক্ষর)" }),
  phone: z
    .string()
    .min(11, { message: "সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন" })
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, {
      message: "সঠিক বাংলাদেশী মোবাইল নম্বর লিখুন (যেমন: 01712345678)",
    }),
  address: z
    .string()
    .min(5, { message: "অনুগ্রহ করে পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা/জেলা)" }),
  email: z
    .string()
    .email({ message: "সঠিক ইমেইল ফরম্যাট লিখুন (যেমন: name@gmail.com)" })
    .optional()
    .nullable()
    .or(z.literal("")),
  hasNote: z.boolean().optional(),
  altPhone: z.string().optional().nullable().or(z.literal("")),
  note: z.string().optional().nullable().or(z.literal("")),
  paymentMethod: z.enum(["COD", "BKASH", "SSLCOMMERZ"], {
    message: "পেমেন্ট মাধ্যম সিলেক্ট করুন",
  }),
  division: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
