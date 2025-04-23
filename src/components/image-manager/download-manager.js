import "./download-manager.css";
const jsonData = require("./local-file.json");

function bytesToSize(bytes, precision = 1) {
  if (bytes === 0) return "0 bytes";
  const units = ["bytes", "Kb", "Mb", "Gb", "Tb"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, index)).toFixed(precision) + " " + units[index]
  );
}

export default class DownloadManager {
  constructor(container) {
    this.container = this.bindToDOM(container);
    this.downloadManager;
    this.fileSheet;
    this.totalBytes;
    this.bytesDownloaded = 0;
    this.init();
  }

  init() {
    this.createBaseDom();
    this.displayFiles();
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("Container is not HTMLElement!");
    }
    return container;
  }

  downloadFile(numFile) {
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = `data:${jsonData.files[numFile].contentType};base64,${jsonData.files[numFile].dataFile}`;
    link.download =
      jsonData.files[numFile].name + "." + jsonData.files[numFile].extension;
    link.click();
    this.bytesDownloaded += DownloadManager.fileSize(numFile);
    this.displayBytesDownloaded();
  }

  static fileSize(numFile) {
    return atob(jsonData.files[numFile].dataFile).length;
  }

  onClickFileLink(numFile, event) {
    event.preventDefault();
    this.downloadFile(numFile);
    console.log(numFile);
  }

  displayBytesDownloaded() {
    this.totalBytes.textContent = bytesToSize(this.bytesDownloaded);
  }

  displayFiles() {
    if (jsonData.files) {
      const files = jsonData.files;
      for (const [index, file] of files.entries()) {
        this.createFileDom(
          file.name,
          bytesToSize(DownloadManager.fileSize(index)),
          index,
        );
      }
    }
  }

  createFileDom(name, size, numFile) {
    const file = document.createElement("li");
    file.classList.add("file");
    this.fileSheet.appendChild(file);
    file.insertAdjacentHTML(
      "beforeend",
      `
      <h3 class="file-title">${name}</h3>
      <div class="file-size">${size}</div>
      <a class="file-link" href="#">Download</a>
    `,
    );
    const fileLink = file.querySelector(".file-link");
    fileLink.addEventListener(
      "click",
      this.onClickFileLink.bind(this, numFile),
    );
  }

  createBaseDom() {
    this.container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="download-manager">
        <div class="available-files-block">
          <h2 class="available-files-title">
            Available Files (without sms and registration):
          </h2>
          <ul class="file-sheet">
          </ul>      
        </div>
        <div class="total-downloaded">
          You've already downloaded: <span class="total-bytes"></span>
        </div>
      </div>
    `,
    );
    this.downloadManager = this.container.querySelector(".download-manager");
    this.fileSheet = this.downloadManager.querySelector(".file-sheet");
    this.totalBytes = this.downloadManager.querySelector(".total-bytes");
    this.displayBytesDownloaded();
  }
}
