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

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("Container is not HTMLElement!");
    }
    return container;
  }

  init() {
    this.createBaseDom();
    this.displayFiles();
    this.eventInit();
  }

  eventInit() {
    this.fileSheet.addEventListener("click", this.onClickFileSheet.bind(this));
  }

  onClickFileSheet(event) {
    if (
      event.target &&
      event.target.tagName === "A" &&
      event.target.classList.contains("file-link")
    ) {
      event.preventDefault();
      const file = event.target.closest(".file");
      const numFile = file.dataset.id;
      const progressElement = file.querySelector(".file-progress");
      this.downloadFile(
        numFile,
        this.updateProgress.bind(this, progressElement),
      );
    }
  }

  updateProgress(progressElement, value, max) {
    progressElement.max = max;
    progressElement.value = value;
  }

  async downloadFile(numFile, updateProgress) {
    updateProgress(0, 0);
    const response = await fetch(
      `data:${jsonData.files[numFile].contentType};base64,${jsonData.files[numFile].dataFile}`,
    );
    const reader = response.body.getReader();
    const contentLength = +response.headers.get("Content-Length");
    let receivedLength = 0;
    let chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      updateProgress(receivedLength, contentLength);
    }
    const blob = new Blob(chunks);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download =
      jsonData.files[numFile].name + "." + jsonData.files[numFile].extension;
    link.click();
    this.bytesDownloaded += receivedLength;
    this.displayBytesDownloaded();
  }

  static fileSize(numFile) {
    return atob(jsonData.files[numFile].dataFile).length;
  }

  onClickFileLink(numFile, event) {
    event.preventDefault();
    this.downloadFile(numFile);
  }

  displayBytesDownloaded() {
    this.totalBytes.textContent = bytesToSize(this.bytesDownloaded);
  }

  displayFiles() {
    if (jsonData.files) {
      const files = jsonData.files;
      for (const [index, file] of files.entries()) {
        this.createFileDom(file.name, index);
      }
    }
  }

  createFileDom(name, numFile) {
    const size = DownloadManager.fileSize(numFile);
    const file = document.createElement("li");
    file.classList.add("file");
    file.dataset.id = numFile;
    this.fileSheet.appendChild(file);
    file.insertAdjacentHTML(
      "beforeend",
      `
      <h3 class="file-title">${name}</h3>
      <div class="file-size">${bytesToSize(size)}</div>
      <progress class="file-progress" max="0" value="0"></progress>
      <a class="file-link" href="#">Download</a>
      `,
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
