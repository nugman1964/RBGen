class RBG_RenderPage {
  
  eCanvas = 0;
  ctx = 0;
  nScale = 1.0;

  constructor(sCanvasID) {
    this.eCanvas = document.getElementById("RBG.page.canvas");
    this.ctx = this.eCanvas.getContext("2d");
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.eCanvas.width, this.eCanvas.height);
  }

  Render(aPageData,aElements) {
    // Clear canvas
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.eCanvas.width, this.eCanvas.height);

    // Render each element
    for (var i = 0; i < aElements.length; i++) {
      var e = aElements[i];
      switch (e.type) {
        case 'text':
          this.ctx.fillStyle = e.color || "black";
          this.ctx.font = e.font || "16px Arial";
          this.ctx.fillText(e.text, e.x, e.y);
          break
        case 'line':
          this.ctx.strokeStyle = e.color || "black";
          this.ctx.lineWidth = e.width || 1;
          this.ctx.beginPath();
          this.ctx.moveTo(e.x1, e.y1);
          this.ctx.lineTo(e.x2, e.y2);
          this.ctx.stroke();
          break;
        case 'rect':
          this.ctx.fillStyle = e.color || "black";
          this.ctx.fillRect(e.x, e.y, e.width, e.height);
      }
      // Add more element types as needed
    }
  }
}