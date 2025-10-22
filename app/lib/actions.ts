// 您可以将文件中的所有导出函数标记为服务器操作。这些服务器函数随后可以导入并用于客户端和服务器组件。此文件中包含的任何未使用的函数都将自动从最终的应用程序包中移除。
"use server";
import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";


const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const schema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: "客户ID是必填项" }),
  amount: z.coerce.number().gt(0, { message: "金额必须大于0" }),
  status: z.enum(["pending", "paid"], { invalid_type_error: "状态是必填项" }),
  date: z.string(),
});

export type State = {
  errors: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export async function createInvoice(prevState: State, formData: FormData) {
  // 服务器端操作  打印只显示在终端
  console.log("🚀 ~ createInvoice ~ formData:", formData);
  const parseData = schema.omit({ id: true, date: true }).safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!parseData.success) {
    return {
      errors: parseData.error.flatten().fieldErrors,
      message: "创建失败",
    };
  }

  const { customerId, amount, status } = parseData.data;
  const date = new Date().toISOString().split("T")[0];
  const amountInCents = amount * 100;
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status},${date})
    `;

  // sql插入后 验证数据刷新
  revalidatePath("/dashboard/invoices");
  // 服务端调用redirect跳转
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  console.log("🚀 ~ updateInvoice ~ formData:", formData);

  const { customerId, amount, status } = schema
    .omit({ id: true, date: true })
    .parse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });

  const amountInCents = amount * 100;
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId},
            amount = ${amountInCents},
            status = ${status}
        WHERE id = ${id}
        `;
  } catch (error) {
    console.log("🚀 ~ updateInvoice ~ error:", error);
    // return {
    //     message:'更新失败'
    // }
  }

  // sql插入后 验证数据刷新
  revalidatePath("/dashboard/invoices");
  // 服务端调用redirect跳转
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`
    DELETE FROM invoices
    WHERE id = ${id}
    `;
  // sql插入后 验证数据刷新
  // revalidatePath('/dashboard/invoices')
  // 服务端调用redirect跳转
  redirect("/dashboard/invoices");
}

export async function authenticate(
  prevState: {message:string} | undefined,
  formData: FormData
) {
    try{
        const redirectTo = formData.get('redirectTo') as string || '/dashboard'
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo
        })

        // 登录成功后重定向
        redirect(redirectTo)
    }catch(error){
        if(error instanceof AuthError){
            switch(error.type){
                case 'CredentialsSignin':
                    return {
                        message:'错误的凭证'
                    }
                default:
                    return {
                        message:'登录失败'
                    }
            }
        }

        // 如果是重定向错误，直接抛出（这是正常的流程）
        if(error instanceof Error && error.message.includes('NEXT_REDIRECT')){
            throw error
        }

        return {
            message:'未知错误'
        }
    }

}
