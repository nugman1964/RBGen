class RBG_Value_C
{
  Value = 0.0; // numeric value
  Unit  = 'mm'; // unit of measurement, e.g., mm, cm,
  DPI   = 600; // dots per inch for pixel conversion

  constructor(vValue, sUnit = 'mm', nDPI = 600) {
    this.Set(vValue, sUnit, nDPI);
  }

  GetUnitFactor(sToUnit,nToDPI=-1)
  {
    var sToUnit = (sToUnit == '' ? this.Unit : sToUnit);
    var nToDPI  = (nToDPI < 0 ? this.DPI : nToDPI);
    switch (this.Unit+'>'+sToUnit) {
      case 'mm>mm': return 1.0;
      case 'mm>cm': return 1.0 / 10.0;
      case 'mm>in': return 1.0 / 25.4;
      case 'mm>px': return 1.0 / 25.4 * nToDPI;
      case 'cm>mm': return 1.0 * 10.0;
      case 'cm>cm': return 1.0;
      case 'cm>in': return 1.0 / 2.54;
      case 'cm>px': return 1.0 / 2.54 * nToDPI;
      case 'in>mm': return 1.0 * 25.4;
      case 'in>cm': return 1.0 * 2.54;
      case 'in>in': return 1.0;
      case 'in>px': return 1.0 * nToDPI;
      case 'px>mm': return 1.0 / this.DPI * 25.4;
      case 'px>cm': return 1.0 / this.DPI * 2.54;
      case 'px>in': return 1.0 / this.DPI;
      case 'px>px': return 1.0 / this.DPI * nToDPI;
      case 'deg>rad': return 1.0 * Math.PI / 180.0;
      case 'rad>deg': return 1.0 / Math.PI * 180.0;
      default:      console.warn(`Unknown unit or incompatible types: ${this.Unit} or ${sToUnit}`);
                    return 1.0;
    }
  }
  
  toUnit(sResUnit,nToDPI=-1)
  {
    return this.Value * this.GetUnitFactor(sResUnit, nToDPI);
  }

  toString(sToUnit='',nToDPI=-1) {
    var nValue = this.toUnit(sToUnit,nToDPI)
    return nValue.toFixed(2)+(sToUnit=='' ? this.Unit : sToUnit);
  }

  Set(vValue, sUnit='', nDPI=-1)
  {
    if (vValue instanceof RBG_Value_C) {
      this.Value = vValue.Value;
      this.Unit = vValue.Unit;
      this.DPI = vValue.DPI;
    } else {
      this.Value = vValue;
      this.Unit = sUnit;
      this.DPI = nDPI;
    }
  }

  Add(vValue, sUnit='', nDPI=-1)
  {
    if (vValue instanceof RBG_Value_C) {
      this.Value += (vValue.Value * this.GetUnitFactor(vValue.Unit, vValue.DPI));
    } else {
      this.Value += (vValue * this.GetUnitFactor(sUnit, nDPI));
    }
  }

  Sub(vValue, sUnit='', nDPI=-1)
  {
    if (vValue instanceof RBG_Value_C) {
      this.Value -= (vValue.Value * this.GetUnitFactor(vValue.Unit, vValue.DPI));
    } else {
      this.Value -= (vValue * this.GetUnitFactor(sUnit, nDPI));
    }
  }

  Mul(nValue)
  {
    this.Value *= nValue;
  }

  Div(nValue)
  {
    this.Value /= nValue;
  }

  ChangeUnit(sNewUnit, nNewDPI=-1)
  {
    if ((sNewUnit != this.Unit) || (nNewDPI != this.DPI)) {
      this.Value = this.toUnit(sNewUnit, nNewDPI);
      this.Unit = sNewUnit;
      this.DPI = nNewDPI;
    }
  }

}

class RBG_RenderOptions_C
{
  DPI       = 96; // Dots per inch for rendering
  Scale     = 1.0; // Scale factor for rendering
  BgColor   = "white"; // Background color for the canvas
  TextColor = "black"; // Default text color
  Font      = "16px Arial"; // Default font for text elements
  LineWidth = 1; // Default line width for line elements
  Ruler     = {
                ShowTop:    true,
                ShowLeft:   true,
                ShowRight:  false,
                ShowBottom: false,
                Width:      new RBG_Value_C(6,'mm'),
                Unit:       'mm',
                Color:      'black',
                BgColor:    'white',
                Font:       '10px sans-serif'
              }
  CanvasOffset = {X:0, Y:0}; // Offset for the canvas rendering

  constructor() {
  }

  SetCanvasOffset(nXOffset, nYOffset)
  {
    this.CanvasOffset.X = nXOffset;
    this.CanvasOffset.Y = nYOffset;
  }
}

class RBG_Document_C {

  DocumentID   = '';
  DocumentName = '';
  PageFormat   = {Width:new RBG_Value_C(210.0), Height:new RBG_Value_C(297.0)}; // A4 in mm
  PrintMargin  = {Top:new RBG_Value_C(3.0), Right:new RBG_Value_C(3.0),
                  Bottom:new RBG_Value_C(3.0), Left:new RBG_Value_C(3.0)} // in mm
  Sections     = [];

  constructor(sID,sName)
  {
    this.DocumentID   = sID;
    this.DocumentName = sName;
    var ActSection = this.AddSection('CoverFront',2);
    var ActSection = this.AddSection('Content',4);
    var ActSection = this.AddSection('CoverBack',2);
  }

  AddSection(sID,nMinPages=2)
  {
    var oSD = new RBG_DocSection_C(this,sID)
    this.Sections.push(oSD);
    for (var i = 0; i < nMinPages; i++)
      oSD.AddPage(''+i);
    return oSD;
  }

  GetSection(sID)
  {
    for (var i = 0; i < this.Sections.length; i++) {
      if (this.Sections[i].SectionID == sID)
        return this.Sections[i];
    }
    return null;
  }

}

class RBG_DocSection_C {

  Document  = null;
  SectionID = '';
  Elements  = [];
  Pages     = [];

  constructor(oDocument,sID)
  {
    this.Document  = oDocument;
    this.SectionID = sID;
    this.Elements.push(new RBG_Elements_C(this));
  }

  AddPage(sPageID)
  {
    var oPageData = new RBG_DocPage_C(this,sPageID);
    this.Elements.push(new RBG_Elements_C(this,oPageData));
    this.Pages.push(oPageData);
    return oPageData;    
  }

  GetPage(sPageID)
  {
    for (var i = 0; i < this.Pages.length; i++) {
      if (this.Pages[i].PageID == sPageID)
        return this.Pages[i];
    }
    return null;
  }

  GetElementsForPage(sPageID)
  {
    for (var i = 0; i < this.Elements.length; i++) {
      if (this.Elements[i].Page && (this.Elements[i].Page.PageID == sPageID))
        return this.Elements[i];
    }
    return null;
  }

}

class RBG_DocPage_C {

  Section = null;
  PageID  = '';

  constructor(oSection,sID)
  {
    this.Section = oSection;
    this.PageID = sID;
  }

  GetSheetWidth(sUnit='mm',nToDPI=-1) {
    var vWidth = new RBG_Value_C(this.Section.Document.PageFormat.Width);
    vWidth.Add(this.Section.Document.PrintMargin.Left);
    vWidth.Add(this.Section.Document.PrintMargin.Right);
    vWidth.ChangeUnit(sUnit,nToDPI);
    console.log('[RBG_DocPage_C] GetSheetWidth() ='+vWidth.toString());
    return vWidth.Value;
  }

  GetSheetHeight(sUnit='mm',nToDPI=-1) {
    var vHeight = new RBG_Value_C(this.Section.Document.PageFormat.Height);
    vHeight.Add(this.Section.Document.PrintMargin.Top);
    vHeight.Add(this.Section.Document.PrintMargin.Bottom);
    vHeight.ChangeUnit(sUnit,nToDPI);
    console.log('[RBG_DocPage_C] GetSheetHeight() ='+vHeight.toString());
    return vHeight.Value;
  }

  Render(sCanvasID,oRenderOptions,bInit=true)
  {
    var aElements = this.Section.GetElementsForPage(this.PageID);
    console.log('aElements.Elements.length = '+aElements.Elements.length);
    if (aElements) {
      // Init canvas
      var eCanvas = document.getElementById(sCanvasID);
      var ctx = eCanvas.getContext("2d");
      if (bInit) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, eCanvas.width, eCanvas.height);
      }
      // Render ruler(s) if enabled
      var nRulerWidthPX = oRenderOptions.Ruler.Width.toUnit('px',oRenderOptions.DPI);
      var nXOffset = (oRenderOptions.Ruler.ShowTop ? nRulerWidthPX : 0);
      var nYOffset = (oRenderOptions.Ruler.ShowLeft ? nRulerWidthPX : 0);
      if (bInit) {
        ctx.strokeStyle  = oRenderOptions.Ruler.Color;
        ctx.lineWidth    = 1;
        ctx.font         = oRenderOptions.Ruler.Font;
        ctx.fillStyle    = oRenderOptions.Ruler.Color;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'top';
        var nSheetWidth = this.GetSheetWidth('mm');
        var nSheetHeight = this.GetSheetHeight('mm');
        if (oRenderOptions.Ruler.ShowTop) {
          console.log('[RBG_DocPage_C] Render Ruler Top (0/'+nRulerWidthPX+') => ('+eCanvas.width+'/'+nRulerWidthPX+')');
          ctx.beginPath();
          ctx.moveTo(0,             nRulerWidthPX);
          ctx.lineTo(eCanvas.width, nRulerWidthPX);
          var nRulerLineX = new RBG_Value_C(1.0,'mm');
          while (nRulerLineX.Value < nSheetWidth) {
            var nRulerLineXPX = nXOffset + nRulerLineX.toUnit('px',oRenderOptions.DPI);
            var nRulerLineY1PX = ((Math.trunc(nRulerLineX.Value) % 10) == 0 ? 0 : nRulerWidthPX / 2);
            var nRulerLineY2PX = nRulerWidthPX;
            ctx.moveTo(nRulerLineXPX, nRulerLineY1PX);
            ctx.lineTo(nRulerLineXPX, nRulerLineY2PX);
            nRulerLineX.Add(1.0);
          }
          ctx.stroke();
          var nRulerLineX = new RBG_Value_C(0.0,'mm');
          while (nRulerLineX.Value < nSheetWidth) {
            var nRulerLineXPX = nXOffset + nRulerLineX.toUnit('px',oRenderOptions.DPI);
            ctx.fillText(Math.trunc(nRulerLineX.Value), nRulerLineXPX+2, 0);
            nRulerLineX.Add(10.0);
          }
        }
        if (oRenderOptions.Ruler.ShowLeft) {
          console.log('[RBG_DocPage_C] Render Ruler Left ('+nRulerWidthPX+'/0) => ('+nRulerWidthPX+'/'+eCanvas.height+')');
          ctx.beginPath();
          ctx.moveTo(nRulerWidthPX, 0);
          ctx.lineTo(nRulerWidthPX, eCanvas.height);
          var nRulerLineY = new RBG_Value_C(1.0,'mm');
          while (nRulerLineY.Value < nSheetHeight) {
            var nRulerLineYPX = nYOffset + nRulerLineY.toUnit('px',oRenderOptions.DPI);
            var nRulerLineX1PX = ((Math.trunc(nRulerLineY.Value) % 10) == 0 ? 0 : nRulerWidthPX / 2);
            var nRulerLineX2PX = nRulerWidthPX;
            ctx.moveTo(nRulerLineX1PX, nRulerLineYPX);
            ctx.lineTo(nRulerLineX2PX, nRulerLineYPX);
            nRulerLineY.Add(1.0);
          }
          ctx.stroke();
          var nRulerLineY = new RBG_Value_C(0.0,'mm');
          while (nRulerLineY.Value < nSheetHeight) {
            var nRulerLineYPX = nYOffset + nRulerLineY.toUnit('px',oRenderOptions.DPI);
            ctx.rotate(-Math.PI / 2); // Rotate context for vertical text
            ctx.translate(-nRulerLineYPX-2, 0);
            ctx.textAlign = 'right';;
            ctx.fillText(Math.trunc(nRulerLineY.Value), 0, 0);
            ctx.resetTransform(); // Reset rotation and translation
            nRulerLineY.Add(10.0);
          }
        }
        if (oRenderOptions.Ruler.ShowBottom) {
          console.log('[RBG_DocPage_C] Render Ruler Bottom (0/'+(eCanvas.height-nRulerWidthPX)+') => ('+eCanvas.width+'/'+(eCanvas.height-nRulerWidthPX)+')');
          ctx.beginPath();
          ctx.moveTo(0,             eCanvas.height-nRulerWidthPX);
          ctx.lineTo(eCanvas.width, eCanvas.height-nRulerWidthPX);
          var nRulerLineX = new RBG_Value_C(1.0,'mm');
          while (nRulerLineX.Value < nSheetWidth) {
            var nRulerLineXPX = nXOffset + nRulerLineX.toUnit('px',oRenderOptions.DPI);
            var nRulerLineY1PX = eCanvas.height - ((Math.trunc(nRulerLineX.Value) % 10) == 0 ? 0 : nRulerWidthPX / 2);
            var nRulerLineY2PX = eCanvas.height - nRulerWidthPX;
            ctx.moveTo(nRulerLineXPX, nRulerLineY1PX);
            ctx.lineTo(nRulerLineXPX, nRulerLineY2PX);
            nRulerLineX.Add(1.0);
          }
          ctx.stroke();
        }
        if (oRenderOptions.Ruler.ShowRight) {
          console.log('[RBG_DocPage_C] Render Ruler Right ('+(eCanvas.width-nRulerWidthPX)+'/0) => ('+(eCanvas.width-nRulerWidthPX)+'/'+eCanvas.height+')');
          ctx.beginPath();
          ctx.moveTo(eCanvas.width-nRulerWidthPX, 0);
          ctx.lineTo(eCanvas.width-nRulerWidthPX, eCanvas.height);
          var nRulerLineY = new RBG_Value_C(1.0,'mm');
          while (nRulerLineY.Value < nSheetHeight) {
            var nRulerLineYPX = nYOffset + nRulerLineY.toUnit('px',oRenderOptions.DPI);
            var nRulerLineX1PX = eCanvas.width - ((Math.trunc(nRulerLineY.Value) % 10) == 0 ? 0 : nRulerWidthPX / 2);
            var nRulerLineX2PX = eCanvas.width - nRulerWidthPX;
            ctx.moveTo(nRulerLineX1PX, nRulerLineYPX);
            ctx.lineTo(nRulerLineX2PX, nRulerLineYPX);
            nRulerLineY.Add(1.0);
          }
          ctx.stroke();
        }
      }
      // Set x/y-offsets from the rulers
      oRenderOptions.SetCanvasOffset(nXOffset, nYOffset);
      // Render all Elements
      aElements.Render(sCanvasID, oRenderOptions);
    } else {
      console.log('aElements = null');
    }
  }

}

class RBG_Elements_C
{
  Section = null;
  Page = null;
  Elements = [];
  CanvasID = '';
  CanvasCtx = null;
  RenderOptions = null;

  constructor(oSection, oPage=null)
  {
    this.Section = oSection;
    this.Page = oPage;
  }

  Add(oElement)
  {
    this.Elements.push(oElement);
    return oElement;
  }

  Clear()
  {
    this.Elements = [];
  }

  Render(sCanvasID, oRenderOptions)
  {
    this.CanvasID = sCanvasID;
    this.RenderOptions = oRenderOptions;
    var eCanvas = document.getElementById(sCanvasID);
    this.CanvasCtx = eCanvas.getContext("2d");
    this.CanvasCtx.translate(oRenderOptions.CanvasOffset.X, oRenderOptions.CanvasOffset.Y);
    this.RenderElements();
  }

  RenderElements()
  {
    // Check that all elements are ready for rendering
    var nElementsReady = 0;
    for (var i = 0; i < this.Elements.length; i++) {
      nElementsReady += (this.Elements[i].IsReadyForRender() ? 1 : 0)
    }
    console.log('[RBG_Elements_C] RenderElements() ElementsReady = ' + nElementsReady + ' of ' + this.Elements.length);
    if (nElementsReady == this.Elements.length) {
      // Render all elements
      for (var i = 0; i < this.Elements.length; i++) {
        this.Elements[i].Render(this.CanvasCtx,this.RenderOptions);
      }
    } else {
      // Try again in 50ms
      setTimeout(this.RenderElements.bind(this), 50);
    }
  }
}

class RBG_ElementBase_C
{
  Name      = '';
  Type      = '';
  X         = null;
  Y         = null;
  Width     = null;
  Height    = null;
  CanRender = false

  constructor(sType, sName, X, Y, Width, Height, sUnit='mm')
  {
    this.type = sType;
    this.Name = sName;
    this.X = new RBG_Value_C(X, sUnit);
    this.Y = new RBG_Value_C(Y, sUnit);
    this.Width = new RBG_Value_C(Width, sUnit);
    this.Height = new RBG_Value_C(Height, sUnit);
  }

  IsReadyForRender()
  {
    return this.CanRender;
  }

  Render(ctx, oRenderOptions)
  {
    console.warn('[RBG_ElementBase_C] Render() not implemented for type: ' + this.type);
  }
}

class RBG_ElementRect_C extends RBG_ElementBase_C
{
  FillColor   = '';
  StrokeColor = '';
  StrokeWidth = new RBG_Value_C(1,'px');

  constructor(sName, X, Y, Width, Height, sUnit='mm')
  {
    super('rect', sName, X, Y, Width, Height, sUnit);
    this.CanRender = true;
  }

  SetFill(sColor)
  {
    this.FillColor = sColor;
  }

  SetStroke(sColor, nWidth=1, sUnit='px')
  {
    this.StrokeColor = sColor;
    this.StrokeWidth = new RBG_Value_C(nWidth, sUnit);
  }

  Render(ctx, oRenderOptions)
  {
    ctx.save();
    if (this.FillColor != '') {
      ctx.fillStyle = this.FillColor;
      ctx.fillRect(this.X.toUnit('px',96.0), this.Y.toUnit('px',96.0),
                   this.Width.toUnit('px',96.0), this.Height.toUnit('px',96.0));
    }
    if (this.StrokeColor != '') {
      ctx.strokeStyle = this.StrokeColor;
      ctx.lineWidth = this.StrokeWidth.toUnit('px',96.0);
      ctx.strokeRect(this.X.toUnit('px',96.0), this.Y.toUnit('px',96.0),
                     this.Width.toUnit('px',96.0), this.Height.toUnit('px',96.0));
    }
    ctx.restore();
  }

}

class RBG_ElementText_C extends RBG_ElementBase_C
{
  Text           = '[no text]';
  TextColor      = 'black';
  TextAlign      = 'left';
  TextBaseline   = 'top';
  FontFamily     = 'serif';
  FontSize       = 16;
  FontSizeUnit   = 'px';
  FontStyle      = 'normal';
  FontWeight     = 'normal';
  FontLineHeight = 'normal';
  FontLHUnit     = ''
  ShadowBlur     = 0;
  ShadowColor    = '';
  ShadowOffsetX  = 0;
  ShadowOffsetY  = 0;
  Rotation       = new RBG_Value_C(0,'deg');

  constructor(sName, X, Y, Width, Height, sUnit='mm')
  {
    super('text', sName, X, Y, Width, Height, sUnit);
    this.CanRender = true;
  }

  SetText(sText)
  {
    this.Text = sText;
  }

  SetAlign(sTextAlign)
  {
    this.TextAlign = sTextAlign;
  }

  SetBaseline(sTextBaseline)
  {
    this.TextBaseline = sTextBaseline;
  }

  SetColor(sColor)
  {
    this.TextColor = sColor;
  }

  SetFont(sFamily, nSize, sSizeUnit, sStyle, sWeight, sLineHeight)
  {
    this.FontFamily     = sFamily;
    this.FontSize       = nSize;
    this.FontSizeUnit   = sSizeUnit;
    this.FontStyle      = sStyle;
    this.FontWeight     = sWeight;
    this.FontLineHeight = sLineHeight;
  }

  SetShadow(nBlur, sColor, nOffsetX, nOffsetY)
  {
    this.ShadowBlur = nBlur;
    this.ShadowColor = sColor;
    this.ShadowOffsetX = nOffsetX;
    this.ShadowOffsetY = nOffsetY;
  }

  SetRotation(nAngle, sUnit='deg')
  {
    this.Rotation.Set(nAngle, sUnit);
  }

  Render(ctx, oRenderOptions)
  {
    ctx.save();
    ctx.font = (this.FontStyle != '' ? this.FontStyle+' ' : '') +
               (this.FontWeight != '' ? this.FontWeight+' ' : '') +
               this.FontSize+this.FontSizeUnit+' '+
               (this.FontLineHeight != '' ? this.FontLineHeight+this.FontLHUnit+' ' : '') +
               this.FontFamily;
    ctx.fillStyle = this.TextColor;
    ctx.textAlign = this.TextAlign;
    ctx.textBaseline = this.TextBaseline;
    ctx.shadowBlur = this.ShadowBlur;
    ctx.shadowColor = this.ShadowColor;
    ctx.shadowOffsetX = this.ShadowOffsetX;
    ctx.shadowOffsetY = this.ShadowOffsetY;
    if (this.Rotation.Value != 0)
      ctx.rotate(this.Rotation.toUnit('rad'));
    ctx.fillText(this.Text, this.X.toUnit('px',96.0), this.Y.toUnit('px',96.0));
    ctx.restore();
  }
}

class RBG_ElementImage_C extends RBG_ElementBase_C
{

  Filename    = '';
  Filters     = {Opacity: '100%'}
  CompositeOp = 'source-over'; // Default composite operation
  ImageObject = null;
  ImageLoaded = false;

  constructor(sName, X, Y, Width, Height, sUnit='mm')
  {
    super('image', sName, X, Y, Width, Height, sUnit);
    this.CanRender = false;
  }

  SetFilename(sFilename)
  {
    this.Filename = sFilename;
    this.ImageLoaded = false;
    this.ImageObject = new Image();
    this.ImageObject.onload = this.ImageOnLoadCB.bind(this);
    this.ImageObject.src = this.Filename;
  }

  SetOpacity(nOpacity)
  {
    this.Filters.Opacity = nOpacity;
  }

  SetCompositeOperation(sCompositeOp)
  {
    this.CompositeOp = (sCompositeOp == '' ? 'source-over' : sCompositeOp);
  }

  ImageOnLoadCB()
  {
    this.ImageLoaded = true;
    this.CanRender = true;
    console.log('[RBG_ElementImage_C] Image loaded: ' + this.Filename);
  }

  Render(ctx, oRenderOptions)
  {
    ctx.save();
    ctx.filter = 'opacity(' + this.Filters.Opacity + ')';
    ctx.globalCompositeOperation = this.CompositeOp;
    if (this.Width.Value > 0)
      ctx.drawImage(this.ImageObject,
                    this.X.toUnit('px',96.0), this.Y.toUnit('px',96.0),
                    this.Width.toUnit('px',96.0), this.Height.toUnit('px',96.0));
    else
      ctx.drawImage(this.ImageObject,
                    this.X.toUnit('px',96.0), this.Y.toUnit('px',96.0))
    ctx.restore();
  }

}

console.log('[RBG] lib/rbg_data.js loaded ...');
