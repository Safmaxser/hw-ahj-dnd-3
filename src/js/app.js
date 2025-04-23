import DownloadManager from "../components/image-manager/download-manager";

document.addEventListener("DOMContentLoaded", () => {
  new DownloadManager(document.documentElement.children[1]);
});
