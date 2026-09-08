async function testLogin() {
  const baseUrl = "http://localhost:3000";

  // 1. Get CSRF Token
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const cookies = csrfRes.headers.get("set-cookie") || "";

  console.log("CSRF Token obtained:", csrfToken ? "Yes" : "No");

  // 2. Post credentials
  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies,
    },
    body: new URLSearchParams({
      csrfToken,
      email: "dev.anwarul@gmail.com",
      password: "dev.anwarul",
      redirect: "false",
      callbackUrl: `${baseUrl}/admin`,
    }),
    redirect: "manual",
  });

  console.log("Login Status Code:", loginRes.status);
  const rawSetCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
  const cookieJar = rawSetCookies.map((c) => c.split(";")[0]).join("; ");
  console.log("Cookie jar:", cookieJar);

  // 3. Check Session with the cookie
  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: {
      Cookie: cookieJar,
    },
  });

  if (sessionRes.ok) {
    const session = await sessionRes.json();
    console.log("Authenticated User Session:", JSON.stringify(session, null, 2));
  } else {
    console.log("Session response error:", sessionRes.status);
  }
}

testLogin().catch(console.error);
