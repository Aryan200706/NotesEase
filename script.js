const branches = ["CSE AI ML", "CSE CS", "Robotics and Automation"];
const semesters = Array.from({ length: 8 }, (_, index) => `Semester ${index + 1}`);
const dbName = "notesease-db";
const dbVersion = 1;
const usersKey = "notesease-users";
const sessionKey = "notesease-session";
const adminEmail = "admin@notesease.com";
const adminPassword = "Admin@123";

const state = {
  db: null,
  notes: [],
  currentUser: null,
  authMode: "login",
  selectedPreviewNote: null,
  toastTimer: null
};


const elements = {
  openLoginBtn: document.querySelector("#openLoginBtn"),
  openSignupBtn: document.querySelector("#openSignupBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  profileChip: document.querySelector("#profileChip"),
  profileInitial: document.querySelector("#profileInitial"),
  profileName: document.querySelector("#profileName"),
  accessStatus: document.querySelector("#accessStatus"),
  totalNotes: document.querySelector("#totalNotes"),
  notesGrid: document.querySelector("#notesGrid"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  branchFilter: document.querySelector("#branchFilter"),
  semesterFilter: document.querySelector("#semesterFilter"),
  subjectFilter: document.querySelector("#subjectFilter"),
  noteBranch: document.querySelector("#noteBranch"),
  noteSemester: document.querySelector("#noteSemester"),
  uploadForm: document.querySelector("#uploadForm"),
  noteTitle: document.querySelector("#noteTitle"),
  noteSubject: document.querySelector("#noteSubject"),
  noteDescription: document.querySelector("#noteDescription"),
  noteFile: document.querySelector("#noteFile"),
  selectedFileName: document.querySelector("#selectedFileName"),
  dropzone: document.querySelector("#dropzone"),
  authModal: document.querySelector("#authModal"),
  authForm: document.querySelector("#authForm"),
  authName: document.querySelector("#authName"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authTitle: document.querySelector("#authTitle"),
  authEyebrow: document.querySelector("#authEyebrow"),
  authSubmitBtn: document.querySelector("#authSubmitBtn"),
  authMessage: document.querySelector("#authMessage"),
  switchAuthBtn: document.querySelector("#switchAuthBtn"),
  closeAuthBtn: document.querySelector("#closeAuthBtn"),
  previewModal: document.querySelector("#previewModal"),
  previewMeta: document.querySelector("#previewMeta"),
  previewTitle: document.querySelector("#previewTitle"),
  previewBody: document.querySelector("#previewBody"),
  previewHint: document.querySelector("#previewHint"),
  modalDownloadBtn: document.querySelector("#modalDownloadBtn"),
  closePreviewBtn: document.querySelector("#closePreviewBtn"),
  adminNavLink: document.querySelector("#adminNavLink"),
  adminPanel: document.querySelector("#adminPanel"),
  adminList: document.querySelector("#adminList"),
  adminCount: document.querySelector("#adminCount"),
  toast: document.querySelector("#toast"),
  menuBtn: document.querySelector("#menuBtn"),
};

document.addEventListener("DOMContentLoaded", init);
const {
 auth,
 db,
 storage,
 signInWithEmailAndPassword,
 createUserWithEmailAndPassword,
 signOut,
 onAuthStateChanged,
 collection,
 addDoc,
 getDocs,
 deleteDoc,
 doc,
 ref,
 uploadBytes,
 getDownloadURL,
 deleteObject
} = window.firebaseApp;

const ADMIN_EMAIL = "2007raoaryan@gmail.com";
function isAdmin() {

    return (
        state.currentUser &&
        state.currentUser.email === ADMIN_EMAIL
    );

}

async function init() {
  populateSelects();
  bindEvents();
 onAuthStateChanged(auth, async (user) => {

    state.currentUser = user;
    await loadNotesFromFirestore();

    populateSubjectFilter();

    updateAuthUi();

    renderNotes();
    
});
  updateAuthUi();
  renderNotes();
}




function populateSelects() {
  branches.forEach((branch) => {
    elements.branchFilter.append(new Option(branch, branch));
    elements.noteBranch.append(new Option(branch, branch));
  });

  semesters.forEach((semester) => {
    elements.semesterFilter.append(new Option(semester, semester));
    elements.noteSemester.append(new Option(semester, semester));
  });
}

function bindEvents() {
  elements.openLoginBtn.addEventListener("click", () => openAuth("login"));
  elements.openSignupBtn.addEventListener("click", () => openAuth("signup"));
  elements.logoutBtn.addEventListener("click", logout);
  elements.switchAuthBtn.addEventListener("click", () => {
    openAuth(state.authMode === "login" ? "signup" : "login");
  });
  elements.closeAuthBtn.addEventListener("click", () => elements.authModal.close());
  elements.authForm.addEventListener("submit", handleAuth);

  elements.searchInput.addEventListener("input", renderNotes);
  elements.branchFilter.addEventListener("change", renderNotes);
  elements.semesterFilter.addEventListener("change", renderNotes);
  elements.subjectFilter.addEventListener("change",renderNotes);
  elements.uploadForm.addEventListener("submit", handleUpload);
  elements.noteFile.addEventListener("change", updateSelectedFile);
  elements.closePreviewBtn.addEventListener("click", closePreview);
  elements.modalDownloadBtn.addEventListener("click", () => downloadNote(state.selectedPreviewNote));

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.remove("dragover");
    });
  });

  elements.dropzone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (!file) return;
    elements.noteFile.files = event.dataTransfer.files;
    updateSelectedFile();
  });
}
function populateSubjectFilter() {

    const subjects =
      [...new Set(
          state.notes
              .map(note => note.subject)
              .filter(Boolean)
      )];

    elements.subjectFilter.innerHTML =
      '<option value="all">All subjects</option>';

    subjects.sort().forEach(subject => {

        elements.subjectFilter.append(
            new Option(
                subject,
                subject
            )
        );

    });

}

function openAuth(mode) {
  state.authMode = mode;
  elements.authMessage.textContent = "";
  elements.authForm.reset();
  elements.authName.parentElement.classList.toggle("hidden", mode === "login");
  elements.authTitle.textContent = mode === "login" ? "Log in to NotesEase" : "Create your NotesEase account";
  elements.authEyebrow.textContent = mode === "login" ? "Welcome back" : "Join the library";
  elements.authSubmitBtn.textContent = mode === "login" ? "Log in" : "Sign up";
  elements.switchAuthBtn.textContent = mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in";
  elements.authModal.showModal();
}

async function handleAuth(event) {
  event.preventDefault();

  const name = elements.authName.value.trim();
  const email = elements.authEmail.value.trim().toLowerCase();
  const password = elements.authPassword.value;

  try {

 await createUserWithEmailAndPassword(
      auth,
      email,
      password
 );

 showToast("Account created successfully");

 elements.authModal.close();

}
catch(error){

 elements.authMessage.textContent = error.message;

}

 try {

 await signInWithEmailAndPassword(
      auth,
      email,
      password
 );

 elements.authModal.close();

 showToast("Logged in");

}
catch(error){

 elements.authMessage.textContent = error.message;

}
}

async function logout(){

 await signOut(auth);

 showToast("Logged out");

} 


function updateAuthUi() {

  const isLoggedIn = Boolean(state.currentUser);

 const adminUser = isAdmin();

  


  elements.openLoginBtn.classList.toggle(
    "hidden",
    isLoggedIn
  );

  elements.openSignupBtn.classList.toggle(
    "hidden",
    isLoggedIn
  );

  elements.profileChip.classList.toggle(
    "hidden",
    !isLoggedIn
  );

  elements.adminNavLink.classList.toggle(
    "hidden",
    !adminUser
  );

  elements.adminPanel.classList.toggle(
    "hidden",
    !adminUser
  );

  elements.accessStatus.textContent =
    isLoggedIn
      ? "Upload and download"
      : "Preview only";


  if (isLoggedIn) {
   const displayName =
    state.currentUser.displayName ||
    state.currentUser.email;

    elements.profileName.textContent =
    displayName;

    elements.profileInitial.textContent =
    displayName.charAt(0).toUpperCase();
  }
  if (isAdmin()) {

    elements.profileName.textContent +=
        " (Admin)";

}

  if (state.selectedPreviewNote) {
    elements.previewHint.textContent = isLoggedIn ? "Download the file to view the complete material." : "Sign in to download the PDF.";
    elements.modalDownloadBtn.disabled = !isLoggedIn;
  }
  elements.menuBtn?.addEventListener(
  "click",
  toggleMobileMenu
);

  renderAdminNotes();
}

function getFilteredNotes() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const branch = elements.branchFilter.value;
  const semester = elements.semesterFilter.value;
  const subject =elements.subjectFilter.value;

  return state.notes.filter((note) => {
    const searchable = `${note.title} ${note.subject} ${note.description} ${note.uploader}`.toLowerCase();
    return (
      (!query || searchable.includes(query)) &&
      (branch === "all" || note.branch === branch) &&

      (semester === "all" || note.semester === semester) &&

      (subject === "all" || note.subject === subject)
    );
  });
}

function renderNotes() {
  const notes = getFilteredNotes();
  elements.totalNotes.textContent = state.notes.length;
  elements.notesGrid.innerHTML = "";
  elements.emptyState.classList.toggle("hidden", notes.length > 0);

  notes.forEach((note) => {
    const card = document.createElement("article");
    card.className = "note-card";
    card.innerHTML = `
      <div class="preview-window">${createPreviewMarkup(note)}</div>
      <div class="note-content">
        <div class="meta-list">
        <span>${escapeHtml(note.branch)}</span>
        <span>${escapeHtml(note.semester)}</span>
        <span>${escapeHtml(note.subject)}</span>
       <span>${formatSize(note.fileSize)}</span>
      </div>
        <h3>${escapeHtml(note.title)}</h3>
        <p>${escapeHtml(note.description || "Preview this PDF before downloading it.")}</p>
        <span class="format-pill">PDF</span>
      </div>
      <div class="note-actions">
  <button class="preview-btn" type="button"
    data-action="preview"
    data-id="${note.id}">
    Preview
  </button>

  <button class="download-btn" type="button"
    data-action="download"
    data-id="${note.id}">
    Download
  </button>

  ${
    state.currentUser &&
   note.uploader === state.currentUser.email ||
      isAdmin()
      ? `
      <button class="delete-btn"
        type="button"
        data-action="delete"
        data-id="${note.id}">
        Delete
      </button>
      `
      : ""
  }

</div>
    `;

    card.querySelector("[data-action='preview']").addEventListener("click", () => openPreview(note));
    card.querySelector("[data-action='download']").addEventListener("click", () => downloadNote(note));
    const deleteButton =
  card.querySelector('[data-action="delete"]');

if (deleteButton) {

  deleteButton.addEventListener(
    "click",
    () => deleteNote(note)
  );

}
    elements.notesGrid.append(card);
  });
}

function createPreviewMarkup(note){

   return `
      <div class="pdf-thumb">

         <div class="file-icon">
            PDF
         </div>

         <p>Preview Available</p>

      </div>
   `;

}

async function openPreview(note){

    elements.previewTitle.textContent =
        note.title;

    elements.previewMeta.textContent =
        `${note.branch} • Semester ${note.semester}`;

    await renderPdfPreview(note.fileUrl);

    elements.previewModal.showModal();
}

function closePreview() {
  elements.previewModal.close();
  state.selectedPreviewNote = null;
}

async function handleUpload(event) {
  event.preventDefault();

  if (!state.currentUser) {
    openAuth("login");
    showToast("Please log in before uploading a note.");
    return;
  }

  const [file] = elements.noteFile.files;
  const duplicate = state.notes.some(note =>
    note.fileName === file.name &&
    note.fileSize === file.size
);

if (duplicate) {
    showToast("This file already exists");
    return;
}
  if (!file) {
    showToast("Choose a PDF file to upload.");
    return;
  }

  if (!isAllowedFile(file)) {
    showToast("Only PDF files are supported.");
    return;
  }
  const noteId = crypto.randomUUID();

const storageRef =
ref(storage, `notes/${noteId}.pdf`);

await uploadBytes(
 storageRef,
 file
);

const fileUrl =
await getDownloadURL(storageRef);

await addDoc(
 collection(db, "notes"),
 {
   id: noteId,
   title: elements.noteTitle.value.trim(),
   subject: elements.noteSubject.value.trim(),
   branch: elements.noteBranch.value,
   semester: elements.noteSemester.value,
   description: elements.noteDescription.value.trim(),
   uploader: state.currentUser.email,
   fileName: file.name,
   fileSize: file.size,
   fileUrl: fileUrl,
   createdAt: Date.now()
 }
);

  elements.uploadForm.reset();
  elements.selectedFileName.textContent = "Only PDF files are accepted";
  await loadNotesFromFirestore();
  populateSubjectFilter();
  renderNotes();
  showToast("Note uploaded to the library.");
  document.querySelector("#library").scrollIntoView({ behavior: "smooth", block: "start" });
}
async function loadNotesFromFirestore() {

    const snapshot =
        await getDocs(collection(db, "notes"));

    state.notes =
        snapshot.docs.map(docSnap => ({
            firestoreId: docSnap.id,
            ...docSnap.data()
        }));

}

function updateSelectedFile() {
  const [file] = elements.noteFile.files;
  elements.selectedFileName.textContent = file ? `${file.name} (${formatSize(file.size)})` : "Only PDF files are accepted";
}

function downloadNote(note){

 if(!state.currentUser){

   openAuth("login");
   return;

 }

 const link =
 document.createElement("a");

 link.href = note.fileUrl;

 link.download = note.fileName;

 link.click();

}

function isAllowedFile(file) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function normalizeFileType(file) {
  return file.type || "application/pdf";
}

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, index);
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAdminNotes() {
  const isAdmin =
  state.currentUser?.email === ADMIN_EMAIL;
  elements.adminNavLink.classList.toggle("hidden", !isAdmin);
  elements.adminPanel.classList.toggle("hidden", !isAdmin);
  elements.adminCount.textContent = state.notes.length;

  if (!isAdmin) {
    elements.adminList.innerHTML = "";
    return;
  }

  const rows = state.notes.map((note) => `
    <div class="admin-row">
      <div class="admin-info">
        <strong>${escapeHtml(note.title)}</strong>
        <span>${escapeHtml(note.branch)} · ${escapeHtml(note.semester)}</span>
        <span>${escapeHtml(note.uploader)} · ${formatSize(note.fileSize)}</span>
      </div>
      <button class="primary-btn" type="button" data-id="${note.id}">Delete</button>
    </div>
  `).join("");

  elements.adminList.innerHTML = rows || "<p>No notes are available yet.</p>";
  elements.adminList.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", () => deleteNote(button.dataset.id));
  });
}

async function deleteNote(id) {
  await runStore("readwrite", (store) => store.delete(id));
  state.notes = await getAllNotes();
  renderNotes();
  renderAdminNotes();
  showToast("Note removed from the library.");
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  state.toastTimer = setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 3200);
}

async function deleteNote(note) {

    try {

        const confirmed = confirm(
            `Delete "${note.title}" ?`
        );

        if (!confirmed) return;

        const storageRef =
            ref(storage, `notes/${note.id}.pdf`);

        await deleteObject(storageRef);

        await deleteDoc(
            doc(db, "notes", note.firestoreId)
        );

        await loadNotesFromFirestore();

        renderNotes();

        showToast("Note deleted");

    } catch (error) {

        console.error(error);

        showToast("Delete failed");

    }

}
function openPreview(note){

    elements.previewBody.innerHTML = `
      <iframe
         src="${note.fileUrl}#toolbar=0"
         width="100%"
         height="700">
      </iframe>
    `;

    elements.previewModal.showModal();
}
function toggleMobileMenu(){

  document
    .querySelector(".topnav")
    .classList.toggle("show");

}