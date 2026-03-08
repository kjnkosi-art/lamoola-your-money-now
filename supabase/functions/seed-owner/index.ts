import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const email = "owner@lamoola.co.za";
    const password = "Lamoola2024!";

    // Create user via admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Lamoola", last_name: "Owner" },
    });

    if (createError) {
      // User might already exist
      if (createError.message.includes("already been registered")) {
        return new Response(JSON.stringify({ message: "Owner user already exists", email }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      throw createError;
    }

    // Assign owner role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userData.user.id, role: "owner" });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({
        message: "Owner user seeded successfully",
        email,
        password,
        user_id: userData.user.id,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
