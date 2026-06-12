import html2canvas from "html2canvas";

export async function exportPng(node: HTMLElement): Promise<void> {
  await document.fonts.ready;

  const canvas = await html2canvas(node, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "charashou.png";
  a.click();
}
