/**
 * A1 — Test Flow UI/API LokaID
 * Jalankan: npx tsx scripts/test-lokaid-flow.ts
 */

const BASE = "http://localhost:3000";

// -- Helpers --
async function getSession(username: string): Promise<Record<string, string>> {
  // 1. get CSRF
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie?.() ?? [];
  const { csrfToken } = await csrfRes.json() as { csrfToken: string };

  // collect cookies
  const jar: string[] = [...csrfCookies.map(c => c.split(";")[0])];

  // 2. login
  const body = new URLSearchParams({
    username,
    password: "mitra123",
    csrfToken,
    callbackUrl: `${BASE}/dashboard`,
    json: "true",
  });
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar.join("; ") },
    body: body.toString(),
    redirect: "manual",
  });
  const loginCookies = loginRes.headers.getSetCookie?.() ?? [];
  jar.push(...loginCookies.map(c => c.split(";")[0]));

  return { Cookie: jar.join("; ") };
}

async function apiGet(path: string, headers: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, { headers, redirect: "manual" });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, json, text };
}

async function apiPost(path: string, body: any, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers ?? {}) },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, json, text };
}

// -- Test runner --
type Result = { name: string; pass: boolean; detail: string };
const results: Result[] = [];

function ok(name: string, detail: string) { results.push({ name, pass: true, detail }); }
function fail(name: string, detail: string) { results.push({ name, pass: false, detail }); }

async function main() {
  console.log("Logging in as sukasari...");
  const sukasari = await getSession("sukasari");
  console.log("Logging in as kelurahan...");
  const kelurahan = await getSession("kelurahan");

  const TOKEN_SUKASARI = "tok_wil_sukasari_2026_w1i2l3a4";

  // ── TEST 1: Cari penduduk by UID ──
  {
    const { status, json } = await apiGet("/api/lokaid/cari-penduduk?uid=A1B2C3D4", sukasari);
    if (status === 200 && json?.penduduk?.nama === "Budi Santoso") {
      ok("T1 Cari penduduk by UID", `kondisi=${json.kondisi}, nama=${json.penduduk.nama}`);
    } else {
      fail("T1 Cari penduduk by UID", `status=${status}, body=${JSON.stringify(json).slice(0, 200)}`);
    }
  }

  // ── TEST 2: List program ──
  {
    const { status, json } = await apiGet("/api/lokaid/program", sukasari);
    const programs = json?.programs ?? json;
    if (status === 200 && Array.isArray(programs) && programs.length >= 2) {
      const names = programs.map((p: any) => p.nama).join(", ");
      ok("T2 List program", `${programs.length} programs: ${names}`);
    } else {
      fail("T2 List program", `status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
    }
  }

  // ── TEST 3: List peserta program Sembako (id=1) ──
  {
    const { status, json } = await apiGet("/api/lokaid/program/1/peserta", sukasari);
    const peserta = json?.peserta;
    if (status === 200 && Array.isArray(peserta)) {
      const sudah = peserta.filter((p: any) => p.statusPeriodeIni === "sudah_terima").length;
      const belum = peserta.filter((p: any) => p.statusPeriodeIni === "belum" || !p.statusPeriodeIni).length;
      ok("T3 Peserta Sembako", `total=${peserta.length}, sudah_terima=${sudah}, belum=${belum}`);
    } else {
      fail("T3 Peserta Sembako", `status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
    }
  }

  // ── TEST 4: List dependent Posyandu (id=2) ──
  {
    const { status, json } = await apiGet("/api/lokaid/program/2/dependent", sukasari);
    const wali = json?.wali;
    if (status === 200 && Array.isArray(wali)) {
      const totalAnak = wali.reduce((s: number, w: any) => s + (w.anak?.length ?? 0), 0);
      ok("T4 Dependent Posyandu", `wali=${wali.length}, anak=${totalAnak}`);
    } else {
      fail("T4 Dependent Posyandu", `status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
    }
  }

  // ── TEST 5: Get field values peserta Posyandu (peserta id=7, Budi wali) ──
  {
    const { status, json } = await apiGet("/api/lokaid/peserta/7/data", sukasari);
    const data = json?.data;
    if (status === 200 && Array.isArray(data) && data.length > 0) {
      const fields = data.map((d: any) => `${d.kode}=${d.nilai ?? "null"}`).join(", ");
      ok("T5 Field values peserta", fields);
    } else {
      fail("T5 Field values peserta", `status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
    }
  }

  // ── TEST 6: Distribusi Bansos (Eko, belum terima) ──
  {
    const { status, json } = await apiPost("/api/lokaid/distribusi", {
      token: TOKEN_SUKASARI,
      uid: "Q7R8S9T0",
      program_id: 1,
    });
    if (status === 200 && json?.aktivitas_id) {
      ok("T6 Distribusi (belum terima)", `aktivitas_id=${json.aktivitas_id}, nama=${json.nama}`);
    } else {
      fail("T6 Distribusi (belum terima)", `status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
    }
  }

  // ── TEST 7: Distribusi Bansos klaim ganda (Budi, sudah terima) ──
  {
    const { status, json } = await apiPost("/api/lokaid/distribusi", {
      token: TOKEN_SUKASARI,
      uid: "A1B2C3D4",
      program_id: 1,
    });
    if (status !== 200 || json?.error) {
      ok("T7 Klaim ganda ditolak", `status=${status}, error=${json?.error ?? "rejected"}`);
    } else {
      fail("T7 Klaim ganda ditolak", `SEHARUSNYA ditolak! status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
    }
  }

  // ── TEST 8: Checkin Posyandu (wali ke-4, belum hadir) ──
  // peserta id=10 = Dewi Lestari, uidKartu=M3N4O5P6, status=tidak_hadir
  {
    const { status, json } = await apiPost("/api/lokaid/checkin", {
      token: TOKEN_SUKASARI,
      uid: "M3N4O5P6",
      program_id: 2,
    });
    if (status === 200 && json?.aktivitas_id) {
      ok("T8 Checkin Posyandu", `aktivitas_id=${json.aktivitas_id}, nama=${json.nama}`);
    } else {
      // might fail if quota reached or already checked in — still report
      fail("T8 Checkin Posyandu", `status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
    }
  }

  // ── TEST 9: Generate QR token ──
  {
    const { status, json } = await apiPost("/api/lokaid/program/2/qr", {}, sukasari);
    if (status === 200 && json?.token) {
      ok("T9 Generate QR", `token=${json.token.slice(0, 16)}..., scan_url=${json.scan_url}`);
      // Save for test 10
      (globalThis as any).__qrToken = json.token;
    } else {
      fail("T9 Generate QR", `status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
    }
  }

  // ── TEST 10: Validate QR token ──
  {
    const token = (globalThis as any).__qrToken;
    if (!token) {
      fail("T10 Validate QR", "skipped — no QR token from T9");
    } else {
      const { status, json } = await apiGet(`/api/lokaid/qr/${token}/validate`, {});
      if (status === 200 && json?.program) {
        ok("T10 Validate QR", `program=${json.program.nama}, cabang=${json.cabang.nama}`);
      } else {
        fail("T10 Validate QR", `status=${status}, body=${JSON.stringify(json).slice(0, 300)}`);
      }
    }
  }

  // ── REPORT ──
  console.log("\n════════════════════════════════════════");
  console.log("  A1 TEST RESULTS");
  console.log("════════════════════════════════════════");
  let passed = 0, failed = 0;
  for (const r of results) {
    const icon = r.pass ? "✓" : "✗";
    console.log(`  ${icon} ${r.name}`);
    console.log(`    ${r.detail}`);
    if (r.pass) passed++; else failed++;
  }
  console.log("════════════════════════════════════════");
  console.log(`  TOTAL: ${passed} passed, ${failed} failed`);
  console.log("════════════════════════════════════════");
}

main().catch(e => { console.error(e); process.exit(1); });