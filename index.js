// Telegram Bot -- MDF Portfolio CRUD (Projects + Certs)
// ── Menus ──────────────────────────────────────────────────────────────────
const mainMenu = { inline_keyboard: [[{ text: "Certificates", callback_data: "menu_certs" },{ text: "Projects", callback_data: "menu_projects" }],[{ text: "Work Exp", callback_data: "menu_we" },{ text: "Social Media", callback_data: "menu_social" }],[{ text: "Profile", callback_data: "menu_profile" },{ text: "Status", callback_data: "menu_status" }],[{ text: "Help", callback_data: "menu_help" }]] };
const certMenu = { inline_keyboard: [[{ text: "Add Cert", callback_data: "cert_add" },{ text: "List Certs", callback_data: "cert_list" }],[{ text: "Update Cert", callback_data: "cert_update" },{ text: "Delete Cert", callback_data: "cert_delete" }],[{ text: "Back", callback_data: "menu_back" }]] };
const projectMenu = { inline_keyboard: [[{ text: "Add Project", callback_data: "proj_add" },{ text: "List Projects", callback_data: "proj_list" }],[{ text: "Update Project", callback_data: "proj_update" },{ text: "Delete Project", callback_data: "proj_delete" }],[{ text: "Back", callback_data: "menu_back" }]] };
const confirmMenu = (data) => ({ inline_keyboard: [[{ text: "Ya, Simpan", callback_data: `confirm_yes_${data}` },{ text: "Batal", callback_data: "confirm_no" }]] });

const workExpMenu = { inline_keyboard: [[{ text: "Add Work Exp", callback_data: "we_add" },{ text: "List Work Exp", callback_data: "we_list" }],[{ text: "Update Work Exp", callback_data: "we_update" },{ text: "Delete Work Exp", callback_data: "we_delete" }],[{ text: "Back", callback_data: "menu_back" }]] };
const socialMenu = { inline_keyboard: [[{ text: "➕ Add", callback_data: "social_add" },{ text: "📋 List", callback_data: "social_list" }],[{ text: "✏️ Update", callback_data: "social_update" },{ text: "🗑️ Delete", callback_data: "social_delete" }],[{ text: "⬅️ Back", callback_data: "menu_back" }]] };
const profileMenu = { inline_keyboard: [[{ text: "👁️ View Profile", callback_data: "profile_view" },{ text: "✏️ Update Profile", callback_data: "profile_update" }],[{ text: "⬅️ Back", callback_data: "menu_back" }]] };
const SOCIAL_FIELDS = ["name","url"];
const SOCIAL_KEYS = ["email","whatsapp","linkedin","github","instagram","facebook","youtube","tiktok","twitterOrX","threads","telegram","discord","store"];
const PROFILE_FIELDS = [
  { key: "title_en", section: "title", lang: "en", label: "Title (English)" },
  { key: "title_id", section: "title", lang: "id", label: "Title (Indonesia)" },
  { key: "shorts_en", section: "descriptionShorts", lang: "en", label: "Short Bio (English)" },
  { key: "shorts_id", section: "descriptionShorts", lang: "id", label: "Short Bio (Indonesia)" },
  { key: "desc_en", section: "description", lang: "en", label: "Full Bio (English)" },
  { key: "desc_id", section: "description", lang: "id", label: "Full Bio (Indonesia)" },
];

const WE_FIELDS = [{key:"title",label:"Job Title"},{key:"company",label:"Company (atau - skip)"},{key:"startDate",label:"Start Date (contoh: January 2024)"},{key:"endDate",label:"End Date (contoh: Present atau March 2025)"},{key:"descEn",label:"Desc English"},{key:"descId",label:"Desc Indonesia"},{key:"location",label:"Location"},{key:"remote",label:"Remote? (yes/no)"}];
const PROJ_FIELDS = [{key:"title",label:"Title"},{key:"descEn",label:"Desc EN"},{key:"descId",label:"Desc ID"},{key:"category",label:"Category (web/mobile/desktop/telegram-bot/ai-chat/whatsapp-bot)"},{key:"technologies",label:"Tech Stack (pisah koma)"},{key:"github",label:"GitHub URL"},{key:"demo",label:"Demo URL"},{key:"status",label:"Status (Completed/In Progress/On Hold)"}];
const CERT_FIELDS = [{key:"title",label:"Title"},{key:"issuer",label:"Issuer"},{key:"issueDate",label:"Issue Date (contoh: 15 June 2025)"},{key:"verificationUrl",label:"Verification URL (atau - skip)"}];

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response(JSON.stringify({ status: "MDF Telegram Bot running!" }), { headers: { "Content-Type": "application/json" } });
    let body; try { body = JSON.parse(await request.text()); } catch { return new Response("ok"); }
    const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const ALLOWED = env.TELEGRAM_ALLOWED_USER;

    // ── Callbacks ──────────────────────────────────────────────────────────
    if (body.callback_query) {
      const cq = body.callback_query;
      const chatId = cq.message.chat.id;
      const username = cq.from?.username || "";
      const data = cq.data;
      await answerCallback(BOT_TOKEN, cq.id);
      if (ALLOWED && username !== ALLOWED) { await sendMessage(BOT_TOKEN, chatId, "Unauthorized."); return new Response("ok"); }

      if (data === "menu_back" || data === "menu_help") { await sendMainMenu(BOT_TOKEN, chatId); return new Response("ok"); }
      if (data === "menu_status") { await sendMessage(BOT_TOKEN, chatId, `Bot running! ${env.GITHUB_REPO} / ${env.GITHUB_BRANCH}`); return new Response("ok"); }
      if (data === "menu_certs") { await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Certificates Menu", "", certMenu); return new Response("ok"); }
      if (data === "cert_list" || data === "menu_listcerts") { await handleListCerts(BOT_TOKEN, chatId, env); return new Response("ok"); }
      if (data === "cert_add" || data === "menu_addcert") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "cert_title" }), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Add Certificate\nStep 1/4 -- Ketik judul sertifikat:"); return new Response("ok"); }
      if (data === "cert_delete") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "cert_delete_idx" }), { expirationTtl: 300 }); await handleListCerts(BOT_TOKEN, chatId, env); await sendMessage(BOT_TOKEN, chatId, "Ketik nomor sertifikat yang ingin dihapus:"); return new Response("ok"); }
      if (data === "cert_update") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "cert_update_select" }), { expirationTtl: 300 }); await handleListCerts(BOT_TOKEN, chatId, env); await sendMessage(BOT_TOKEN, chatId, "Ketik nomor sertifikat yang ingin diupdate:"); return new Response("ok"); }
      if (data === "menu_projects") { await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Projects Menu", "", projectMenu); return new Response("ok"); }
      if (data === "proj_list") { await handleListProjects(BOT_TOKEN, chatId, env); return new Response("ok"); }
      if (data === "proj_add") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "proj_title" }), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Add Project -- Step 1/8\nKetik judul project:"); return new Response("ok"); }
      if (data === "proj_delete") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "proj_delete_idx" }), { expirationTtl: 300 }); await handleListProjects(BOT_TOKEN, chatId, env); await sendMessage(BOT_TOKEN, chatId, "Ketik nomor project yang ingin dihapus:"); return new Response("ok"); }
      if (data === "menu_we") { await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Work Experience Menu", "", workExpMenu); return new Response("ok"); }
      if (data === "we_list") { await handleListWorkExp(BOT_TOKEN, chatId, env); return new Response("ok"); }
      if (data === "we_add") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "we_title" }), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Add Work Experience\nStep 1/8 -- Ketik Job Title:"); return new Response("ok"); }
      if (data === "we_delete") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "we_delete_idx" }), { expirationTtl: 300 }); await handleListWorkExp(BOT_TOKEN, chatId, env); await sendMessage(BOT_TOKEN, chatId, "Ketik nomor work experience yang ingin dihapus:"); return new Response("ok"); }
      if (data === "we_update") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "we_update_select" }), { expirationTtl: 300 }); await handleListWorkExp(BOT_TOKEN, chatId, env); await sendMessage(BOT_TOKEN, chatId, "Ketik nomor work experience yang ingin diupdate:"); return new Response("ok"); }
      if (data === "menu_social") { await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Social Media Menu", "", socialMenu); return new Response("ok"); }
      if (data === "social_list") { await handleListSocialMedia(BOT_TOKEN, chatId, env); return new Response("ok"); }
      if (data === "social_update") {
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "social_select_key" }), { expirationTtl: 600 });
        await handleListSocialMedia(BOT_TOKEN, chatId, env);
        const keyList = SOCIAL_KEYS.map((k,i) => (i+1)+". "+k).join("\n");
        await sendMessage(BOT_TOKEN, chatId, "Ketik nomor platform yang mau diupdate:\n"+keyList);
        return new Response("ok");
      }
      if (data === "social_add") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "social_add_key" }), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Tambah Social Media Baru\n\nStep 1/3 -- Ketik key/platform (contoh: discord, tiktok, website):"); return new Response("ok"); }
      if (data === "social_delete") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "social_delete_key" }), { expirationTtl: 300 }); await handleListSocialMedia(BOT_TOKEN, chatId, env); await sendMessage(BOT_TOKEN, chatId, "Ketik nomor platform yang mau dihapus:"); return new Response("ok"); }
      if (data === "proj_update") { await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "proj_update_select" }), { expirationTtl: 300 }); await handleListProjects(BOT_TOKEN, chatId, env); await sendMessage(BOT_TOKEN, chatId, "Ketik nomor project yang ingin diupdate:"); return new Response("ok"); }
      if (data === "menu_profile") { await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Profile Menu", "", profileMenu); return new Response("ok"); }
      if (data === "profile_view") { await handleViewProfile(BOT_TOKEN, chatId, env); return new Response("ok"); }
      if (data === "profile_update") {
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify({ step: "profile_select_field" }), { expirationTtl: 600 });
        await handleViewProfile(BOT_TOKEN, chatId, env);
        const fl = PROFILE_FIELDS.map((f, i) => `${i + 1}. ${f.label}`).join("\n");
        await sendMessage(BOT_TOKEN, chatId, "Pilih field profile yang mau diupdate:\n\n" + fl + "\n\nKetik nomor (1-6):");
        return new Response("ok");
      }

      if (data.startsWith("confirm_yes_")) {
        const pendingKey = data.replace("confirm_yes_", "");
        const stateRaw = await env.BOT_STATE.get(`pending:${chatId}`);
        if (!stateRaw) { await sendMessage(BOT_TOKEN, chatId, "Data expired. Mulai ulang."); return new Response("ok"); }
        try {
          const payload = JSON.parse(stateRaw);
          if (pendingKey === "cert") { await saveCertToGithub(env, payload); await sendMessage(BOT_TOKEN, chatId, `Cert Tersimpan! ${payload.title} / ${payload.issuer} -- Deploy ~30 detik...`); }
          else if (pendingKey === "cert_update") { await updateCertInGithub(env, payload.idx, payload.updates); const su = Object.entries(payload.updates).map(([k,v]) => k+": "+v).join(", "); await sendMessage(BOT_TOKEN, chatId, "Cert Diupdate! "+su+" -- Deploy ~30 detik..."); }
          else if (pendingKey === "cert_del") { const ct = await deleteCertFromGithub(env, payload.deleteIdx); await sendMessage(BOT_TOKEN, chatId, "Cert Terhapus: "+ct+" -- Deploy ~30 detik..."); }
          else if (pendingKey === "proj") { await saveProjectToGithub(env, payload); await sendMessage(BOT_TOKEN, chatId, `Project Tersimpan! ${payload.title} / ${payload.category} -- Deploy ~30 detik...`); }
          else if (pendingKey === "proj_update") { await updateProjectInGithub(env, payload.idx, payload.updates); const sp = Object.entries(payload.updates).map(([k,v]) => k+": "+(Array.isArray(v)?v.join(", "):v)).join(", "); await sendMessage(BOT_TOKEN, chatId, "Project Diupdate! "+sp+" -- Deploy ~30 detik..."); }
          else if (pendingKey === "del") { const pt = await deleteProjectFromGithub(env, payload.deleteIdx); await sendMessage(BOT_TOKEN, chatId, "Project Terhapus: "+pt+" -- Deploy ~30 detik..."); }
          else if (pendingKey === "we") { await saveWorkExpToGithub(env, payload); await sendMessage(BOT_TOKEN, chatId, "Work Exp Tersimpan! "+payload.title+(payload.company?" @ "+payload.company:"")+" -- Deploy ~30 detik..."); }
          else if (pendingKey === "we_update") { await updateWorkExpInGithub(env, payload.idx, payload.updates); const su2 = Object.entries(payload.updates).map(([k,v]) => k+": "+v).join(", "); await sendMessage(BOT_TOKEN, chatId, "Work Exp Diupdate! "+su2+" -- Deploy ~30 detik..."); }
          else if (pendingKey === "we_del") { const wt = await deleteWorkExpFromGithub(env, payload.deleteIdx); await sendMessage(BOT_TOKEN, chatId, "Work Exp Terhapus: "+wt+" -- Deploy ~30 detik..."); }
        else if (pendingKey === "social_update") { await updateSocialMediaInGithub(env, payload.key, payload.field, payload.value); await sendMessage(BOT_TOKEN, chatId, "Social Media Diupdate!\n\n"+payload.key+"."+payload.field+": "+payload.value+"\n\nDeploy ~30 detik..."); }
        else if (pendingKey === "social_add") { await addSocialMediaToGithub(env, payload.key, payload.name, payload.url); await sendMessage(BOT_TOKEN, chatId, "Social Media Ditambah!\n\n"+payload.key+": "+payload.name+" ("+payload.url+")\n\nDeploy ~30 detik..."); }
        else if (pendingKey === "social_del") { await deleteSocialMediaFromGithub(env, payload.key); await sendMessage(BOT_TOKEN, chatId, "Social Media Dihapus!\n\n"+payload.key+"\n\nDeploy ~30 detik..."); }
        else if (pendingKey === "profile") { await updateProfileInGithub(env, payload.section, payload.lang, payload.value); await sendMessage(BOT_TOKEN, chatId, "Profile Diupdate!\n\n"+payload.label+" berhasil diperbarui.\n\nDeploy ~30 detik..."); }
          else { await sendMessage(BOT_TOKEN, chatId, "Aksi tidak dikenal."); return new Response("ok"); }
          await env.BOT_STATE.delete(`pending:${chatId}`);
          await sendMainMenu(BOT_TOKEN, chatId);
        } catch (e) {
          await sendMessage(BOT_TOKEN, chatId, `Gagal menyimpan: ${e.message}. Data masih tersimpan, silakan tekan Ya lagi.`);
        }
        return new Response("ok");
      }

      if (data === "confirm_no") { await env.BOT_STATE.delete(`pending:${chatId}`); await env.BOT_STATE.delete(`state:${chatId}`); await sendMessage(BOT_TOKEN, chatId, "Dibatalkan."); await sendMainMenu(BOT_TOKEN, chatId); return new Response("ok"); }
      return new Response("ok");
    }

    // ── Text message ───────────────────────────────────────────────────────
    const message = body?.message;
    if (!message) return new Response("ok");
    const chatId = message.chat?.id;
    const text = message.text || "";
    const username = message.from?.username || "";
    const lowerText = text.toLowerCase().trim();
    if (ALLOWED && username !== ALLOWED) { await sendMessage(BOT_TOKEN, chatId, "Unauthorized."); return new Response("ok"); }
    if (lowerText === "/start" || lowerText === "/help") { await sendMainMenu(BOT_TOKEN, chatId); return new Response("ok"); }
    if (lowerText === "/status") { await sendMessage(BOT_TOKEN, chatId, `Bot running! ${env.GITHUB_REPO} / ${env.GITHUB_BRANCH}`); return new Response("ok"); }
    if (lowerText === "/listcerts") { await handleListCerts(BOT_TOKEN, chatId, env); return new Response("ok"); }
    if (lowerText === "/listprojects") { await handleListProjects(BOT_TOKEN, chatId, env); return new Response("ok"); }
    if (lowerText === "/profile") { await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Profile Menu", "", profileMenu); return new Response("ok"); }

    // ── State machine ──────────────────────────────────────────────────────
    const stateRaw = await env.BOT_STATE.get(`state:${chatId}`);
    if (stateRaw) {
      const state = JSON.parse(stateRaw);

      // cert add
      if (state.step === "cert_title") { state.title = text; state.step = "cert_issuer"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, `Judul: ${text}\nStep 2/4 -- Ketik issuer:`); return new Response("ok"); }
      if (state.step === "cert_issuer") { state.issuer = text; state.step = "cert_date"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, `Issuer: ${text}\nStep 3/4 -- Ketik tanggal:`); return new Response("ok"); }
      if (state.step === "cert_date") { state.issueDate = text; state.step = "cert_url"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, `Tanggal: ${text}\nStep 4/4 -- Ketik URL verifikasi (atau - skip):`); return new Response("ok"); }
      if (state.step === "cert_url") { state.verificationUrl = text === "-" ? "" : text; await env.BOT_STATE.delete(`state:${chatId}`); await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessageWithKeyboard(BOT_TOKEN, chatId, `Konfirmasi Cert\nJudul: ${state.title}\nIssuer: ${state.issuer}\nTanggal: ${state.issueDate}\nURL: ${state.verificationUrl||"-"}\nSimpan?`, "", confirmMenu("cert")); return new Response("ok"); }

      // cert delete
      if (state.step === "cert_delete_idx") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid:"); return new Response("ok"); }
        try {
          const fd = await getGithubFile(env, "src/data/certifications-dynamic.json");
          const certs = JSON.parse(atob(fd.content));
          if (idx >= certs.length) { await sendMessage(BOT_TOKEN, chatId, `Nomor harus antara 1-${certs.length}.`); return new Response("ok"); }
          const target = certs[idx];
          await env.BOT_STATE.delete(`state:${chatId}`);
          await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ deleteIdx: idx, title: target.title }), { expirationTtl: 300 });
          await sendMessageWithKeyboard(BOT_TOKEN, chatId, `Hapus sertifikat?\n${target.title}\n${target.issuer}\nTidak bisa dibatalkan.`, "", confirmMenu("cert_del"));
        } catch (e) { await sendMessage(BOT_TOKEN, chatId, `Error: ${e.message}`); }
        return new Response("ok");
      }

      // cert update select
      if (state.step === "cert_update_select") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid:"); return new Response("ok"); }
        try {
          const fd = await getGithubFile(env, "src/data/certifications-dynamic.json");
          const certs = JSON.parse(atob(fd.content));
          if (idx >= certs.length) { await sendMessage(BOT_TOKEN, chatId, `Nomor harus antara 1-${certs.length}.`); return new Response("ok"); }
          const cert = certs[idx];
          state.step = "cert_update_field"; state.updateIdx = idx; state.updates = {};
          await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
          const cur = `Title: ${cert.title}\nIssuer: ${cert.issuer}\nDate: ${cert.issueDate}\nURL: ${cert.verificationUrl||"-"}`;
          const fl = CERT_FIELDS.map((f,i) => (i+1)+". "+f.label).join("\n");
          await sendMessage(BOT_TOKEN, chatId, `Update: ${cert.title}\n\n${cur}\n\nPilih field:\n${fl}\n\nKetik nomor (pisah koma, contoh: 1,3 atau 2):`);
        } catch (e) { await sendMessage(BOT_TOKEN, chatId, `Error: ${e.message}`); }
        return new Response("ok");
      }

      // cert update field
      if (state.step === "cert_update_field") {
        const nums = text.split(",").map(n => parseInt(n.trim())-1).filter(n => n>=0 && n<CERT_FIELDS.length);
        if (nums.length === 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid (1-4):"); return new Response("ok"); }
        state.fieldQueue = [...nums]; state.step = "cert_update_value";
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        const next = CERT_FIELDS[state.fieldQueue[0]];
        await sendMessage(BOT_TOKEN, chatId, `Ketik nilai baru untuk ${next.label}:`);
        return new Response("ok");
      }

      // cert update value
      if (state.step === "cert_update_value") {
        const fieldIdx = state.fieldQueue.shift();
        const fieldKey = CERT_FIELDS[fieldIdx].key;
        state.updates[fieldKey] = text === "-" ? "" : text;
        if (state.fieldQueue.length > 0) {
          await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
          const next = CERT_FIELDS[state.fieldQueue[0]];
          await sendMessage(BOT_TOKEN, chatId, `Disimpan. Ketik nilai baru untuk ${next.label}:`);
        } else {
          await env.BOT_STATE.delete(`state:${chatId}`);
          await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ idx: state.updateIdx, updates: state.updates }), { expirationTtl: 600 });
          const summary = Object.entries(state.updates).map(([k,v]) => k+": "+v).join("\n");
          await sendMessageWithKeyboard(BOT_TOKEN, chatId, `Konfirmasi Update Cert\n\n${summary}\n\nSimpan perubahan?`, "", confirmMenu("cert_update"));
        }
        return new Response("ok");
      }

      // project add
      if (state.step === "proj_title") { state.title = text; state.step = "proj_desc_en"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, `Title: ${text}\nStep 2/8 -- Deskripsi English:`); return new Response("ok"); }
      if (state.step === "proj_desc_en") { state.descEn = text; state.step = "proj_desc_id"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Desc EN disimpan.\nStep 3/8 -- Deskripsi Bahasa Indonesia:"); return new Response("ok"); }
      if (state.step === "proj_desc_id") { state.descId = text; state.step = "proj_category"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Desc ID disimpan.\nStep 4/8 -- Kategori (web/mobile/desktop/telegram-bot/ai-chat/whatsapp-bot):"); return new Response("ok"); }
      if (state.step === "proj_category") {
        const cat = text.toLowerCase().trim();
        const validCats = ["web","mobile","desktop","telegram-bot","ai-chat","whatsapp-bot","bot-telegram","bot-whatsapp"];
        if (!validCats.includes(cat)) { await sendMessage(BOT_TOKEN, chatId, "Harus salah satu: web, mobile, desktop, telegram-bot, ai-chat, whatsapp-bot. Coba lagi:"); return new Response("ok"); }
        state.category = cat; state.step = "proj_techs";
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        await sendMessage(BOT_TOKEN, chatId, `Kategori: ${cat}\nStep 5/8 -- Tech stack (pisah koma):`); return new Response("ok");
      }
      if (state.step === "proj_techs") { state.technologies = text.split(",").map(t=>t.trim()).filter(Boolean); state.step = "proj_github"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, `Techs: ${state.technologies.join(", ")}\nStep 6/8 -- GitHub URL (atau - skip):`); return new Response("ok"); }
      if (state.step === "proj_github") { state.github = text==="-"?"":text; state.step = "proj_demo"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "GitHub disimpan.\nStep 7/8 -- Demo URL (atau - skip):"); return new Response("ok"); }
      if (state.step === "proj_demo") { state.demo = text==="-"?"":text; state.step = "proj_status"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Demo disimpan.\nStep 8/8 -- Status (Completed/In Progress/On Hold):"); return new Response("ok"); }
      if (state.step === "proj_status") {
        const norm = text.trim();
        if (!["completed","in progress","on hold"].includes(norm.toLowerCase())) { await sendMessage(BOT_TOKEN, chatId, "Status harus: Completed, In Progress, atau On Hold. Coba lagi:"); return new Response("ok"); }
        state.status = norm; await env.BOT_STATE.delete(`state:${chatId}`); await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        await sendMessageWithKeyboard(BOT_TOKEN, chatId, `Konfirmasi Project\nTitle: ${state.title}\nCategory: ${state.category}\nTechs: ${state.technologies.join(", ")}\nGitHub: ${state.github||"-"}\nDemo: ${state.demo||"-"}\nStatus: ${state.status}\nSimpan?`, "", confirmMenu("proj")); return new Response("ok");
      }

      // project delete
      if (state.step === "proj_delete_idx") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid:"); return new Response("ok"); }
        try {
          const fd = await getGithubFile(env, "src/data/projects-dynamic.json");
          const projects = JSON.parse(atob(fd.content));
          if (idx >= projects.length) { await sendMessage(BOT_TOKEN, chatId, `Nomor harus antara 1-${projects.length}.`); return new Response("ok"); }
          const target = projects[idx];
          await env.BOT_STATE.delete(`state:${chatId}`);
          await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ deleteIdx: idx, title: target.title }), { expirationTtl: 300 });
          await sendMessageWithKeyboard(BOT_TOKEN, chatId, `Hapus project?\n${target.title}\nTidak bisa dibatalkan.`, "", confirmMenu("del"));
        } catch (e) { await sendMessage(BOT_TOKEN, chatId, `Error: ${e.message}`); }
        return new Response("ok");
      }

      // project update select
      if (state.step === "proj_update_select") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid:"); return new Response("ok"); }
        try {
          const fd = await getGithubFile(env, "src/data/projects-dynamic.json");
          const projects = JSON.parse(atob(fd.content));
          if (idx >= projects.length) { await sendMessage(BOT_TOKEN, chatId, `Nomor harus antara 1-${projects.length}.`); return new Response("ok"); }
          const p = projects[idx];
          state.step = "proj_update_field"; state.updateIdx = idx; state.updates = {};
          await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
          const cur = [
            "Title: "+p.title,
            "Desc EN: "+(p.description?.en||"").slice(0,60),
            "Desc ID: "+(p.description?.id||"").slice(0,60),
            "Category: "+p.category,
            "Techs: "+(p.technologies||[]).join(", "),
            "GitHub: "+(p.github||"-"),
            "Demo: "+(p.demo||"-"),
            "Status: "+p.status,
          ].join("\n");
          const fl = PROJ_FIELDS.map((f,i) => (i+1)+". "+f.label).join("\n");
          await sendMessage(BOT_TOKEN, chatId, `Update: ${p.title}\n\n${cur}\n\nPilih field:\n${fl}\n\nKetik nomor (pisah koma, contoh: 4,7 atau 3):`);
        } catch (e) { await sendMessage(BOT_TOKEN, chatId, `Error: ${e.message}`); }
        return new Response("ok");
      }

      // project update field
      if (state.step === "proj_update_field") {
        const nums = text.split(",").map(n => parseInt(n.trim())-1).filter(n => n>=0 && n<PROJ_FIELDS.length);
        if (nums.length === 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid (1-8):"); return new Response("ok"); }
        state.fieldQueue = [...nums]; state.step = "proj_update_value";
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        const next = PROJ_FIELDS[state.fieldQueue[0]];
        await sendMessage(BOT_TOKEN, chatId, `Ketik nilai baru untuk ${next.label}:`);
        return new Response("ok");
      }

      // project update value
      if (state.step === "proj_update_value") {
        const fieldIdx = state.fieldQueue.shift();
        const fieldKey = PROJ_FIELDS[fieldIdx].key;
        const validCats = ["web","mobile","desktop","telegram-bot","ai-chat","whatsapp-bot","bot-telegram","bot-whatsapp"];
        if (fieldKey === "category" && !validCats.includes(text.toLowerCase().trim())) { await sendMessage(BOT_TOKEN, chatId, "Harus: web, mobile, desktop, telegram-bot, ai-chat, atau whatsapp-bot. Coba lagi:"); state.fieldQueue.unshift(fieldIdx); await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); return new Response("ok"); }
        if (fieldKey === "status" && !["completed","in progress","on hold"].includes(text.toLowerCase().trim())) { await sendMessage(BOT_TOKEN, chatId, "Harus: Completed, In Progress, atau On Hold. Coba lagi:"); state.fieldQueue.unshift(fieldIdx); await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); return new Response("ok"); }
        if (fieldKey === "technologies") state.updates[fieldKey] = text.split(",").map(t=>t.trim()).filter(Boolean);
        else if (fieldKey === "category") state.updates[fieldKey] = text.toLowerCase().trim();
        else state.updates[fieldKey] = text==="-"?"":text;
        if (state.fieldQueue.length > 0) {
          await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
          const next = PROJ_FIELDS[state.fieldQueue[0]];
          await sendMessage(BOT_TOKEN, chatId, `Disimpan. Ketik nilai baru untuk ${next.label}:`);
        } else {
          await env.BOT_STATE.delete(`state:${chatId}`);
          await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ idx: state.updateIdx, updates: state.updates }), { expirationTtl: 600 });
          const summary = Object.entries(state.updates).map(([k,v]) => k+": "+(Array.isArray(v)?v.join(", "):v)).join("\n");
          await sendMessageWithKeyboard(BOT_TOKEN, chatId, `Konfirmasi Update Project\n\n${summary}\n\nSimpan perubahan?`, "", confirmMenu("proj_update"));
        }
        return new Response("ok");
      }
      // ── Work Experience add flow ──────────────────────────────────────────
      if (state.step === "we_title") { state.title = text; state.step = "we_company"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Title: "+text+"\nStep 2/8 -- Company (atau - skip):"); return new Response("ok"); }
      if (state.step === "we_company") { state.company = text==="-"?"":text; state.step = "we_startdate"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Company: "+(state.company||"-")+"\nStep 3/8 -- Start Date (contoh: January 2024):"); return new Response("ok"); }
      if (state.step === "we_startdate") { state.startDate = text; state.step = "we_enddate"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Start: "+text+"\nStep 4/8 -- End Date (contoh: Present atau March 2025):"); return new Response("ok"); }
      if (state.step === "we_enddate") { state.endDate = text; state.step = "we_desc_en"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "End: "+text+"\nStep 5/8 -- Deskripsi English:"); return new Response("ok"); }
      if (state.step === "we_desc_en") { state.descEn = text; state.step = "we_desc_id"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Desc EN disimpan.\nStep 6/8 -- Deskripsi Indonesia:"); return new Response("ok"); }
      if (state.step === "we_desc_id") { state.descId = text; state.step = "we_location"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Desc ID disimpan.\nStep 7/8 -- Location:"); return new Response("ok"); }
      if (state.step === "we_location") { state.location = text; state.step = "we_remote"; await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); await sendMessage(BOT_TOKEN, chatId, "Location: "+text+"\nStep 8/8 -- Remote? (yes/no):"); return new Response("ok"); }
      if (state.step === "we_remote") {
        const rem = text.toLowerCase().trim();
        if (!["yes","no"].includes(rem)) { await sendMessage(BOT_TOKEN, chatId, "Ketik yes atau no:"); return new Response("ok"); }
        state.remote = rem === "yes";
        await env.BOT_STATE.delete(`state:${chatId}`);
        await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        await sendMessageWithKeyboard(BOT_TOKEN, chatId,
          "Konfirmasi Work Experience\nTitle: "+state.title+"\nCompany: "+(state.company||"-")+"\nPeriod: "+state.startDate+" - "+state.endDate+"\nLocation: "+state.location+"\nRemote: "+(state.remote?"Yes":"No")+"\nSimpan?",
          "", confirmMenu("we"));
        return new Response("ok");
      }

      // ── Work Experience delete flow ───────────────────────────────────────
      if (state.step === "we_delete_idx") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid:"); return new Response("ok"); }
        try {
          const fd = await getGithubFile(env, "src/data/workExperience-dynamic.json");
          const items = JSON.parse(atob(fd.content));
          if (idx >= items.length) { await sendMessage(BOT_TOKEN, chatId, `Nomor harus antara 1-${items.length}.`); return new Response("ok"); }
          const target = items[idx];
          await env.BOT_STATE.delete(`state:${chatId}`);
          await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ deleteIdx: idx, title: target.title }), { expirationTtl: 300 });
          await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Hapus work experience?\n"+target.title+(target.company?" @ "+target.company:"")+"\nTidak bisa dibatalkan.", "", confirmMenu("we_del"));
        } catch (e) { await sendMessage(BOT_TOKEN, chatId, "Error: "+e.message); }
        return new Response("ok");
      }

      // ── Work Experience update flow — select ──────────────────────────────
      if (state.step === "we_update_select") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid:"); return new Response("ok"); }
        try {
          const fd = await getGithubFile(env, "src/data/workExperience-dynamic.json");
          const items = JSON.parse(atob(fd.content));
          if (idx >= items.length) { await sendMessage(BOT_TOKEN, chatId, `Nomor harus antara 1-${items.length}.`); return new Response("ok"); }
          const we = items[idx];
          state.step = "we_update_field"; state.updateIdx = idx; state.updates = {};
          await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
          const cur = "Title: "+we.title+"\nCompany: "+(we.company||"-")+"\nStart: "+we.startDate+"\nEnd: "+we.endDate+"\nDesc EN: "+(we.description?.en||"").slice(0,60)+"\nDesc ID: "+(we.description?.id||"").slice(0,60)+"\nLocation: "+we.location+"\nRemote: "+(we.remote?"Yes":"No");
          const fl = WE_FIELDS.map((f,i) => (i+1)+". "+f.label).join("\n");
          await sendMessage(BOT_TOKEN, chatId, "Update: "+we.title+"\n\n"+cur+"\n\nPilih field:\n"+fl+"\n\nKetik nomor (pisah koma, contoh: 1,4 atau 3):");
        } catch (e) { await sendMessage(BOT_TOKEN, chatId, "Error: "+e.message); }
        return new Response("ok");
      }

      // ── Work Experience update flow — pick fields ─────────────────────────
      if (state.step === "we_update_field") {
        const nums = text.split(",").map(n => parseInt(n.trim())-1).filter(n => n>=0 && n<WE_FIELDS.length);
        if (nums.length === 0) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid (1-8):"); return new Response("ok"); }
        state.fieldQueue = [...nums]; state.step = "we_update_value";
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        const next = WE_FIELDS[state.fieldQueue[0]];
        await sendMessage(BOT_TOKEN, chatId, "Ketik nilai baru untuk "+next.label+":");
        return new Response("ok");
      }

      // ── Work Experience update flow — fill values ─────────────────────────
      if (state.step === "we_update_value") {
        const fieldIdx = state.fieldQueue.shift();
        const fieldKey = WE_FIELDS[fieldIdx].key;
        if (fieldKey === "remote") {
          const rem = text.toLowerCase().trim();
          if (!["yes","no"].includes(rem)) { await sendMessage(BOT_TOKEN, chatId, "Ketik yes atau no:"); state.fieldQueue.unshift(fieldIdx); await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 }); return new Response("ok"); }
          state.updates[fieldKey] = rem === "yes";
        } else {
          state.updates[fieldKey] = text==="-"?"":text;
        }
        if (state.fieldQueue.length > 0) {
          await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
          const next = WE_FIELDS[state.fieldQueue[0]];
          await sendMessage(BOT_TOKEN, chatId, "Disimpan. Ketik nilai baru untuk "+next.label+":");
        } else {
          await env.BOT_STATE.delete(`state:${chatId}`);
          await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ idx: state.updateIdx, updates: state.updates }), { expirationTtl: 600 });
          const summary = Object.entries(state.updates).map(([k,v]) => k+": "+v).join("\n");
          await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Konfirmasi Update Work Exp\n\n"+summary+"\n\nSimpan perubahan?", "", confirmMenu("we_update"));
        }
        return new Response("ok");
      }

      // ── Social Media update flow ──────────────────────────────────────────
      if (state.step === "social_select_key") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0 || idx >= SOCIAL_KEYS.length) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid (1-"+SOCIAL_KEYS.length+"):"); return new Response("ok"); }
        const key = SOCIAL_KEYS[idx];
        state.step = "social_select_field"; state.socialKey = key;
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        await sendMessage(BOT_TOKEN, chatId, "Platform: "+key+"\n\nMau update field apa?\n1. name\n2. url\n\nKetik 1 atau 2:");
        return new Response("ok");
      }

      if (state.step === "social_select_field") {
        const f = text.trim();
        if (f !== "1" && f !== "2") { await sendMessage(BOT_TOKEN, chatId, "Ketik 1 (name) atau 2 (url):"); return new Response("ok"); }
        state.socialField = f === "1" ? "name" : "url";
        state.step = "social_new_value";
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        await sendMessage(BOT_TOKEN, chatId, "Ketik nilai baru untuk "+state.socialKey+"."+state.socialField+":");
        return new Response("ok");
      }

      if (state.step === "social_new_value") {
        const newVal = text.trim();
        await env.BOT_STATE.delete(`state:${chatId}`);
        await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ key: state.socialKey, field: state.socialField, value: newVal }), { expirationTtl: 600 });
        await sendMessageWithKeyboard(BOT_TOKEN, chatId,
          "Konfirmasi Update Social Media\n\nPlatform: "+state.socialKey+"\nField: "+state.socialField+"\nNilai baru: "+newVal+"\n\nSimpan?",
          "", confirmMenu("social_update"));
        return new Response("ok");
      }

      // Social Media add flow
      if (state.step === "social_add_key") {
        const key = text.toLowerCase().trim().replace(/\s+/g, "_");
        if (!key || key.length < 2) { await sendMessage(BOT_TOKEN, chatId, "Key tidak valid. Contoh: discord, website, tiktok:"); return new Response("ok"); }
        state.socialNewKey = key; state.step = "social_add_name";
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        await sendMessage(BOT_TOKEN, chatId, "Key: "+key+"\nStep 2/3 -- Ketik nama/handle (contoh: @username, +6281xxx):");
        return new Response("ok");
      }
      if (state.step === "social_add_name") {
        state.socialNewName = text; state.step = "social_add_url";
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        await sendMessage(BOT_TOKEN, chatId, "Name: "+text+"\nStep 3/3 -- Ketik URL (contoh: https://t.me/username):");
        return new Response("ok");
      }
      if (state.step === "social_add_url") {
        const url = text.trim();
        await env.BOT_STATE.delete(`state:${chatId}`);
        await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ key: state.socialNewKey, name: state.socialNewName, url }), { expirationTtl: 600 });
        await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Konfirmasi Tambah Social Media\n\nKey: "+state.socialNewKey+"\nName: "+state.socialNewName+"\nURL: "+url+"\n\nSimpan?", "", confirmMenu("social_add"));
        return new Response("ok");
      }

      // Social Media delete flow
      if (state.step === "social_delete_key") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0 || idx >= SOCIAL_KEYS.length) { await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid (1-"+SOCIAL_KEYS.length+"):"); return new Response("ok"); }
        const key = SOCIAL_KEYS[idx];
        await env.BOT_STATE.delete(`state:${chatId}`);
        await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({ key }), { expirationTtl: 300 });
        await sendMessageWithKeyboard(BOT_TOKEN, chatId, "Hapus Social Media?\n\n"+key+"\n\nTidak bisa dibatalkan.", "", confirmMenu("social_del"));
        return new Response("ok");
      }

      // ── Profile update flow ───────────────────────────────────────────────
      if (state.step === "profile_select_field") {
        const idx = parseInt(text.trim()) - 1;
        if (isNaN(idx) || idx < 0 || idx >= PROFILE_FIELDS.length) {
          await sendMessage(BOT_TOKEN, chatId, "Nomor tidak valid (1-" + PROFILE_FIELDS.length + "):");
          return new Response("ok");
        }
        const field = PROFILE_FIELDS[idx];
        state.step = "profile_new_value";
        state.fieldIndex = idx;
        await env.BOT_STATE.put(`state:${chatId}`, JSON.stringify(state), { expirationTtl: 600 });
        await sendMessage(BOT_TOKEN, chatId, "Field: " + field.label + "\n\nKetik nilai baru:");
        return new Response("ok");
      }

      if (state.step === "profile_new_value") {
        const newVal = text.trim();
        if (!newVal) {
          await sendMessage(BOT_TOKEN, chatId, "Nilai tidak boleh kosong. Coba lagi:");
          return new Response("ok");
        }
        const field = PROFILE_FIELDS[state.fieldIndex];
        await env.BOT_STATE.delete(`state:${chatId}`);
        await env.BOT_STATE.put(`pending:${chatId}`, JSON.stringify({
          section: field.section,
          lang: field.lang,
          label: field.label,
          value: newVal
        }), { expirationTtl: 600 });
        await sendMessageWithKeyboard(BOT_TOKEN, chatId,
          "Konfirmasi Update Profile\n\nField: " + field.label + "\n\nNilai baru:\n" + newVal + "\n\nSimpan?",
          "", confirmMenu("profile"));
        return new Response("ok");
      }
    }

    await sendMainMenu(BOT_TOKEN, chatId);
    return new Response("ok");
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

async function handleListCerts(token, chatId, env) {
  try {
    const df = await getGithubFile(env, "src/data/certifications-dynamic.json");
    const dc = JSON.parse(atob(df.content));
    const sf = await getGithubFile(env, "src/data/certifications.data.ts");
    const sc = (atob(sf.content).match(/title:/g)||[]).length;
    await sendMessage(token, chatId, `Total: ${sc+dc.length} Sertifikat | Static: ${sc} | Dynamic: ${dc.length}`);
    if (dc.length === 0) { await sendMessage(token, chatId, "Belum ada sertifikat dinamis."); return; }
    let chunk = `Dynamic Certs (${dc.length}):\n`;
    for (let i=0;i<dc.length;i++) { const c=dc[i]; const line=`${i+1}. ${c.title}\n   ${c.issuer} | ${c.issueDate}${c.verificationUrl?"\n   "+c.verificationUrl:""}\n\n`; if ((chunk+line).length>3500){await sendMessage(token,chatId,chunk.trim());chunk=line;}else chunk+=line; }
    if (chunk.trim()) await sendMessage(token, chatId, chunk.trim());
  } catch (e) { await sendMessage(token, chatId, `Error: ${e.message}`); }
}

async function handleListProjects(token, chatId, env) {
  try {
    const fd = await getGithubFile(env, "src/data/projects-dynamic.json");
    const projects = JSON.parse(atob(fd.content));
    if (projects.length === 0) { await sendMessage(token, chatId, "Belum ada project dinamis."); return; }
    let chunk = `Dynamic Projects (${projects.length}):\n`;
    for (let i=0;i<projects.length;i++) { const p=projects[i]; const line=`${i+1}. ${p.title}\n   ${p.category} | ${p.status}\n   ${(p.technologies||[]).slice(0,4).join(", ")}${p.demo?"\n   "+p.demo:""}\n\n`; if ((chunk+line).length>3500){await sendMessage(token,chatId,chunk.trim());chunk=line;}else chunk+=line; }
    if (chunk.trim()) await sendMessage(token, chatId, chunk.trim());
  } catch (e) { await sendMessage(token, chatId, `Error: ${e.message}`); }
}

async function saveCertToGithub(env, cert) {
  const fd = await getGithubFile(env, "src/data/certifications-dynamic.json");
  const certs = JSON.parse(atob(fd.content));
  certs.push({ title:cert.title, issuer:cert.issuer, issueDate:cert.issueDate, validUntil:null, credentialId:"-", description:{en:"",id:""}, skills:[], verificationUrl:cert.verificationUrl||"", image:"", downloadUrl:"", featured:true, categories:["general"] });
  await updateGithubFile(env, "src/data/certifications-dynamic.json", JSON.stringify(certs,null,2), fd.sha, `feat: add cert "${cert.title}" via Telegram bot`);
}

async function updateCertInGithub(env, idx, updates) {
  const fd = await getGithubFile(env, "src/data/certifications-dynamic.json");
  const certs = JSON.parse(atob(fd.content));
  if (idx < 0 || idx >= certs.length) throw new Error("Invalid index");
  const c = certs[idx];
  if (updates.title !== undefined) c.title = updates.title;
  if (updates.issuer !== undefined) c.issuer = updates.issuer;
  if (updates.issueDate !== undefined) c.issueDate = updates.issueDate;
  if (updates.verificationUrl !== undefined) c.verificationUrl = updates.verificationUrl;
  await updateGithubFile(env, "src/data/certifications-dynamic.json", JSON.stringify(certs,null,2), fd.sha, `feat: update cert "${c.title}" via Telegram bot`);
}

async function deleteCertFromGithub(env, idx) {
  const fd = await getGithubFile(env, "src/data/certifications-dynamic.json");
  const certs = JSON.parse(atob(fd.content));
  if (idx < 0 || idx >= certs.length) throw new Error("Invalid index");
  const removed = certs.splice(idx,1)[0];
  await updateGithubFile(env, "src/data/certifications-dynamic.json", JSON.stringify(certs,null,2), fd.sha, `feat: remove cert "${removed.title}" via Telegram bot`);
  return removed.title;
}

async function saveProjectToGithub(env, proj) {
  const fd = await getGithubFile(env, "src/data/projects-dynamic.json");
  const projects = JSON.parse(atob(fd.content));
  projects.push({ slug:proj.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""), title:proj.title, description:{en:proj.descEn||"",id:proj.descId||""}, category:proj.category, projectType:"solo", technologies:proj.technologies||[], image:{LP:[],TB:[],HP:[]}, github:proj.github||"", demo:proj.demo||"", featured:false, caseStudy:{en:"",id:""}, duration:"", teamSize:"1 developer (Solo)", startDate:new Date().toLocaleDateString("en-US",{day:"2-digit",month:"long",year:"numeric"}), endDate:"", status:proj.status||"In Progress", qrCodeImage:"", features:{en:[],id:[]} });
  await updateGithubFile(env, "src/data/projects-dynamic.json", JSON.stringify(projects,null,2), fd.sha, `feat: add project "${proj.title}" via Telegram bot`);
}

async function updateProjectInGithub(env, idx, updates) {
  const fd = await getGithubFile(env, "src/data/projects-dynamic.json");
  const projects = JSON.parse(atob(fd.content));
  if (idx < 0 || idx >= projects.length) throw new Error("Invalid index");
  const p = projects[idx];
  if (updates.title) { p.title=updates.title; p.slug=updates.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
  if (updates.descEn !== undefined) p.description = { ...p.description, en: updates.descEn };
  if (updates.descId !== undefined) p.description = { ...p.description, id: updates.descId };
  if (updates.category) p.category = updates.category;
  if (updates.technologies) p.technologies = updates.technologies;
  if (updates.github !== undefined) p.github = updates.github;
  if (updates.demo !== undefined) p.demo = updates.demo;
  if (updates.status) p.status = updates.status;
  await updateGithubFile(env, "src/data/projects-dynamic.json", JSON.stringify(projects,null,2), fd.sha, `feat: update project "${p.title}" via Telegram bot`);
}

async function deleteProjectFromGithub(env, idx) {
  const fd = await getGithubFile(env, "src/data/projects-dynamic.json");
  const projects = JSON.parse(atob(fd.content));
  if (idx < 0 || idx >= projects.length) throw new Error("Invalid index");
  const removed = projects.splice(idx,1)[0];
  await updateGithubFile(env, "src/data/projects-dynamic.json", JSON.stringify(projects,null,2), fd.sha, `feat: remove project "${removed.title}" via Telegram bot`);
  return removed.title;
}

async function sendMainMenu(token, chatId) { await sendMessageWithKeyboard(token, chatId, "MDF Portfolio Bot\nPilih menu:", "", mainMenu); }
async function sendMessage(token, chatId, text, parseMode = "") { const body = { chat_id: chatId, text }; if (parseMode) body.parse_mode = parseMode; await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
async function sendMessageWithKeyboard(token, chatId, text, parseMode, keyboard) { await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode || undefined, reply_markup: keyboard }) }); }
async function answerCallback(token, callbackQueryId) { await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callback_query_id: callbackQueryId }) }); }
async function getGithubFile(env, path) { const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}?ref=${env.GITHUB_BRANCH}`, { headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, "User-Agent": "MDF-Telegram-Bot" } }); if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`); return res.json(); }
async function updateGithubFile(env, path, content, sha, message) { const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`, { method: "PUT", headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, "Content-Type": "application/json", "User-Agent": "MDF-Telegram-Bot" }, body: JSON.stringify({ message, content: btoa(unescape(encodeURIComponent(content))), sha, branch: env.GITHUB_BRANCH }) }); if (!res.ok) { const err = await res.json(); throw new Error(`GitHub PUT failed: ${JSON.stringify(err)}`); } return res.json(); }

async function handleListWorkExp(token, chatId, env) {
  try {
    const fd = await getGithubFile(env, "src/data/workExperience-dynamic.json");
    const items = JSON.parse(atob(fd.content));
    if (items.length === 0) { await sendMessage(token, chatId, "Belum ada work experience dinamis."); return; }
    let chunk = `Dynamic Work Exp (${items.length}):\n`;
    for (let i=0;i<items.length;i++) {
      const w=items[i];
      const line=`${i+1}. ${w.title}${w.company?" @ "+w.company:""}\n   ${w.startDate} - ${w.endDate}\n   ${w.location} | ${w.remote?"Remote":"On-site"}\n\n`;
      if ((chunk+line).length>3500){await sendMessage(token,chatId,chunk.trim());chunk=line;}else chunk+=line;
    }
    if (chunk.trim()) await sendMessage(token, chatId, chunk.trim());
  } catch (e) { await sendMessage(token, chatId, `Error: ${e.message}`); }
}

async function saveWorkExpToGithub(env, we) {
  const fd = await getGithubFile(env, "src/data/workExperience-dynamic.json");
  const items = JSON.parse(atob(fd.content));
  items.push({
    title: we.title, company: we.company||"",
    startDate: we.startDate, endDate: we.endDate,
    description: { en: we.descEn||"", id: we.descId||"" },
    location: we.location, remote: we.remote===true,
  });
  await updateGithubFile(env, "src/data/workExperience-dynamic.json",
    JSON.stringify(items,null,2), fd.sha,
    `feat: add work experience "${we.title}" via Telegram bot`);
}

async function updateWorkExpInGithub(env, idx, updates) {
  const fd = await getGithubFile(env, "src/data/workExperience-dynamic.json");
  const items = JSON.parse(atob(fd.content));
  if (idx < 0 || idx >= items.length) throw new Error("Invalid index");
  const w = items[idx];
  if (updates.title     !== undefined) w.title     = updates.title;
  if (updates.company   !== undefined) w.company   = updates.company;
  if (updates.startDate !== undefined) w.startDate = updates.startDate;
  if (updates.endDate   !== undefined) w.endDate   = updates.endDate;
  if (updates.descEn    !== undefined) w.description = { ...w.description, en: updates.descEn };
  if (updates.descId    !== undefined) w.description = { ...w.description, id: updates.descId };
  if (updates.location  !== undefined) w.location  = updates.location;
  if (updates.remote    !== undefined) w.remote    = updates.remote;
  await updateGithubFile(env, "src/data/workExperience-dynamic.json",
    JSON.stringify(items,null,2), fd.sha,
    `feat: update work experience "${w.title}" via Telegram bot`);
}

async function deleteWorkExpFromGithub(env, idx) {
  const fd = await getGithubFile(env, "src/data/workExperience-dynamic.json");
  const items = JSON.parse(atob(fd.content));
  if (idx < 0 || idx >= items.length) throw new Error("Invalid index");
  const removed = items.splice(idx,1)[0];
  await updateGithubFile(env, "src/data/workExperience-dynamic.json",
    JSON.stringify(items,null,2), fd.sha,
    `feat: remove work experience "${removed.title}" via Telegram bot`);
  return removed.title + (removed.company ? " @ "+removed.company : "");
}

async function handleListSocialMedia(token, chatId, env) {
  try {
    const fd = await getGithubFile(env, "src/data/mediaSosial.json");
    const data = JSON.parse(atob(fd.content));
    const keys = Object.keys(data);
    // Sync SOCIAL_KEYS from actual JSON so update/delete always use current keys
    SOCIAL_KEYS.length = 0;
    keys.forEach(k => SOCIAL_KEYS.push(k));
    const text = `Social Media Links (${keys.length}):\n\n` + keys.map((k,i) => `${i+1}. ${k}\n   name: ${data[k].name}\n   url:  ${data[k].url}`).join("\n\n");
    await sendMessage(token, chatId, text);
  } catch (e) { await sendMessage(token, chatId, "Error: "+e.message); }
}

async function updateSocialMediaInGithub(env, key, field, value) {
  const fd = await getGithubFile(env, "src/data/mediaSosial.json");
  const data = JSON.parse(atob(fd.content));
  if (!data[key]) throw new Error("Key not found: " + key);
  data[key][field] = value;
  await updateGithubFile(env, "src/data/mediaSosial.json",
    JSON.stringify(data, null, 2), fd.sha,
    `feat: update social media ${key}.${field} via Telegram bot`);
}

async function addSocialMediaToGithub(env, key, name, url) {
  const fd = await getGithubFile(env, "src/data/mediaSosial.json");
  const data = JSON.parse(atob(fd.content));
  if (data[key]) throw new Error("Key sudah ada: " + key + ". Gunakan Update untuk mengubah.");
  data[key] = { name, url };
  // Update SOCIAL_KEYS list is in-memory only; the file update triggers redeploy
  await updateGithubFile(env, "src/data/mediaSosial.json",
    JSON.stringify(data, null, 2), fd.sha,
    `feat: add social media "${key}" via Telegram bot`);
}

async function deleteSocialMediaFromGithub(env, key) {
  const fd = await getGithubFile(env, "src/data/mediaSosial.json");
  const data = JSON.parse(atob(fd.content));
  if (!data[key]) throw new Error("Key tidak ditemukan: " + key);
  delete data[key];
  await updateGithubFile(env, "src/data/mediaSosial.json",
    JSON.stringify(data, null, 2), fd.sha,
    `feat: remove social media "${key}" via Telegram bot`);
}

async function handleViewProfile(token, chatId, env) {
  try {
    const fd = await getGithubFile(env, "src/data/profile-dynamic.json");
    const p = JSON.parse(atob(fd.content));
    const msg = [
      "👤 Profile Dinamis Saat Ini:\n",
      "📌 Title (EN):\n" + (p.title?.en || "-"),
      "📌 Title (ID):\n" + (p.title?.id || "-"),
      "\n📝 Short Bio (EN):\n" + (p.descriptionShorts?.en || "-"),
      "\n📝 Short Bio (ID):\n" + (p.descriptionShorts?.id || "-"),
      "\n📖 Full Bio (EN):\n" + (p.description?.en || "-"),
      "\n📖 Full Bio (ID):\n" + (p.description?.id || "-"),
    ].join("\n");
    await sendMessage(token, chatId, msg);
  } catch (e) {
    await sendMessage(token, chatId, "Error: " + e.message);
  }
}

async function updateProfileInGithub(env, section, lang, value) {
  const fd = await getGithubFile(env, "src/data/profile-dynamic.json");
  const data = JSON.parse(atob(fd.content));
  if (!data[section]) data[section] = {};
  data[section][lang] = value;
  await updateGithubFile(env, "src/data/profile-dynamic.json",
    JSON.stringify(data, null, 2), fd.sha,
    `feat: update profile ${section}.${lang} via Telegram bot`);
}
