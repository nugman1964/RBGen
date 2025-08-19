class RGB_Value_C
{
  Value = 0.0; // numeric value
  Unit  = 'mm'; // unit of measurement, e.g., mm, cm,
  DPI   = 600; // dots per inch for pixel conversion

  constructor(vValue, sUnit = 'mm', nDPI = 600) {
    if (vValue instanceof RGB_Value_C) {
      this.Value = vValue.Value;
      this.Unit = vValue.Unit;
      this.DPI = vValue.DPI;
    } else {
      this.Value = vValue;
      this.Unit = sUnit;
      this.DPI = nDPI;
    }
  }

  toString() {
    return `${this.Value}${this.Unit}`;
  }

  GetUnitFactor(sToUnit,nToDPI=-1)
  {
    var sUnitTo    = (sUnitTo == '' ? this.Unit : sUnitTo);
    var nToDPI     = (nToDPI < 0 ? this.DPI : nToDPI);
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
      default:      console.warn(`Unknown unit or incompatible types: ${this.Unit} or ${sToUnit}`);
                    return 1.0;
    }
  }
  
  toUnit(sResUnit,nToDPI=-1)
  {
    return this.Value * this.GetUnitFactor(sResUnit, nToDPI);
  }

  Add(vValue, sUnit='', nDPI=-1)
  {
    if (vValue instanceof RGB_Value_C) {
      this.Value += (vValue.Value * this.GetUnitFactor(vValue.Unit, vValue.DPI));
    } else {
      this.Value += (vValue * this.GetUnitFactor(sUnit, nDPI));
    }
  }

  Sub(vValue, sUnit='', nDPI=-1)
  {
    if (vValue instanceof RGB_Value_C) {
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

}

class RBG_Document_C {

  DocumentID   = '';
  DocumentName = '';
  PageFormat   = {Width:new RGB_Value_C(297.0), Height:new RGB_Value_C(210.0)}; // A4 in mm
  PrintMargin  = {Top:new RGB_Value_C(3.0), Right:new RGB_Value_C(3.0),
                  Bottom:new RGB_Value_C(3.0), Left:new RGB_Value_C(3.0)} // in mm
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

  GetSheetWidth(sUnit='mm') {
    var vWidth = new RGB_Value_C(this.Section.PageFormat.Width);
    vWidth.Add(this.Section.Document.PrintMargin.Left);
    vWidth.Add(this.Section.Document.PrintMargin.Right);
    return vWidth.toUnit(sUnit);
  }

  GetSheetHeight(sUnit='mm') {
    var vHeight = new RGB_Value_C(this.Section.PageFormat.Height);
    vHeight.Add(this.Section.Document.PrintMargin.Top);
    vHeight.Add(this.Section.Document.PrintMargin.Bottom);
    return vWidth.toUnit(sUnit);
  }

  Render(sCanvasID)
  {
    var aElements = this.Section.GetElementsForPage(this.PageID);
    if (aElements) {
      console.log('aElements.Elements.length = '+aElements.Elements.length);
      // Init canvas
      this.eCanvas = document.getElementById(sCanvasID);
      this.ctx = this.eCanvas.getContext("2d");
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.eCanvas.width, this.eCanvas.height);
      // Render each element
      for (var i = 0; i < aElements.Elements.length; i++) {
        var e = aElements.Elements[i];
        switch (e.type) {
          case 'text':
            this.ctx.fillStyle = e.color;
            this.ctx.font = e.font;
            this.ctx.fillText(e.text, e.x, e.y);
            break
          case 'line':
            this.ctx.strokeStyle = e.color;
            this.ctx.lineWidth = e.width;
            this.ctx.beginPath();
            this.ctx.moveTo(e.x1, e.y1);
            this.ctx.lineTo(e.x2, e.y2);
            this.ctx.stroke();
            break;
          case 'rect':
            this.ctx.fillStyle = e.FillColor;
            this.ctx.fillRect(e.X.toUnit('px',96.0), e.Y.toUnit('px',96.0),
                              e.Width.toUnit('px',96.0), e.Height.toUnit('px',96.0));
        }
      }
    } else {
      console.log('aElements = nil');
    }
  }

}

class RBG_Elements_C
{
  Section = null;
  Page = null;
  Elements = [];

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
}

class RBG_ElementBase_C
{
  Name   = '';
  Type   = '';
  X      = null;
  Y      = null;
  Width  = null;
  Height = null;

  constructor(sType, sName, X, Y, Width, Height, sUnit='mm')
  {
    this.type = sType;
    this.Name = sName;
    this.X = new RGB_Value_C(X, sUnit);
    this.Y = new RGB_Value_C(Y, sUnit);
    this.Width = new RGB_Value_C(Width, sUnit);
    this.Height = new RGB_Value_C(Height, sUnit);
  }
}

class RBG_ElementRect_C extends RBG_ElementBase_C
{
  FillColor = '#FFFFFF'; // default fill color
  StrokeColor = '#000000'; // default stroke color
  StrokeWidth = new RGB_Value_C(0.1, 'mm'); // default stroke width

  constructor(sName, X, Y, Width, Height, sUnit='mm')
  {
    super('rect', sName, X, Y, Width, Height, sUnit);
  }

  SetFill(sColor)
  {
    this.FillColor = sColor;
  }

  SetStroke(sColor, nWidth=0.1, sUnit='mm')
  {
    this.StrokeColor = sColor;
    this.StrokeWidth = new RGB_Value_C(nWidth, sUnit);
  }

}

console.log('[RBG] lib/rbg_data.js loaded ...');
