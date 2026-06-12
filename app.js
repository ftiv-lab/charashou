// === キャラ証 charashou — 最小版 ===
// フィールド定義を1か所にまとめ、ここからフォームを生成してプレビューに連動させる。
// （プレビューの data-field="xxx" 要素と key を対応させる）
const FIELDS = [
  { key: "schoolName",  label: "学校名" },
  { key: "schoolRoman", label: "学校名（ローマ字）" },
  { key: "title",       label: "タイトル" },
  { key: "grade",       label: "学年" },
  { key: "name",        label: "氏名" },
  { key: "nameRoman",   label: "氏名（ローマ字）" },
  { key: "birth",       label: "生年月日" },
  { key: "expiry",      label: "有効期限" },
  { key: "statement",   label: "証明文" },
  { key: "issuer",      label: "発行者" },
];

const form = document.getElementById("form");

// テキスト欄を生成（初期値はプレビューの現在値から取る）
for (const f of FIELDS) {
  const target = document.querySelector(`[data-field="${f.key}"]`);
  const label = document.createElement("label");
  label.className = "field";
  label.innerHTML = `<span>${f.label}</span>`;
  const input = document.createElement("input");
  input.type = "text";
  input.value = target ? target.textContent : "";
  input.addEventListener("input", () => {
    if (target) target.textContent = input.value;
  });
  label.appendChild(input);
  form.appendChild(label);
}

// 顔写真のアップロード（FileReader で dataURL 化 → 同一オリジン扱いで CORS 問題なし）
const photoImg = document.getElementById("photo");
const photoLabel = document.createElement("label");
photoLabel.className = "field";
photoLabel.innerHTML = `<span>顔写真</span>`;
const photoInput = document.createElement("input");
photoInput.type = "file";
photoInput.accept = "image/*";
photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    photoImg.src = e.target.result;
    photoImg.classList.add("on");
  };
  reader.readAsDataURL(file);
});
photoLabel.appendChild(photoInput);
form.appendChild(photoLabel);

// 透かし（薄い繰り返し文字）
document.getElementById("wm").textContent = "COROND JOSHI GAKUIN  ".repeat(60);

// PNG 書き出し
document.getElementById("exportBtn").addEventListener("click", async () => {
  const card = document.getElementById("card");
  // ★日本語フォントの読み込み完了を待ってからキャプチャ（待たないと明朝が反映されない）
  await document.fonts.ready;
  const canvas = await html2canvas(card, {
    scale: 3,               // 高解像度（2040×1290px相当）
    backgroundColor: "#ffffff",
    useCORS: true,
  });
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "charashou.png";
  a.click();
});
