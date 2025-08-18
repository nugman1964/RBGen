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
      this.Value = nValue;
      this.Unit = sUnit;
      this.DPI = nDPI;
    }
  }

  toString() {
    return `${this.Value}${this.Unit}`;
  }

  GetUnitFactor(sFromUnit,sToUnit='',nFromToDPI=-1,nToDPI=-1)
  {
    sUnitTo    = (sUnitTo == '' ? this.Unit : sUnitTo);
    nFromToDPI = (nFromToDPI < 0 ? this.DPI : nFromToDPI);
    nToDPI     = (nToDPI < 0 ? this.DPI : nToDPI);
    switch (sFromUnit+'>'+sToUnit) {
      case 'mm>mm': return 1.0;
      case 'mm>cm': return 1.0 / 10.0;
      case 'mm>in': return 1.0 / 25.4;
      case 'mm>px': return 1.0 / 25.4 * nFromToDPI;
      case 'cm>mm': return 1.0 * 10.0;
      case 'cm>cm': return 1.0;
      case 'cm>in': return 1.0 / 2.54;
      case 'cm>px': return 1.0 / 2.54 * nFromToDPI;
      case 'in>mm': return 1.0 * 25.4;
      case 'in>cm': return 1.0 * 2.54;
      case 'in>in': return 1.0;
      case 'in>px': return 1.0 * nFromToDPI;
      case 'px>mm': return 1.0 / nFromToDPI * 25.4;
      case 'px>cm': return 1.0 / nFromToDPI * 2.54;
      case 'px>in': return 1.0 / nFromToDPI;
      case 'px>px': return 1.0 / nFromToDPI * nToDPI;
      default:      console.warn(`Unknown unit or incompatible types: ${sFromUnit} or ${sToUnit}`);
                    return 1.0;
    }
  }
  
  toUnit(sResUnit,nToDPI=-1)
  {
    return this.Value * this.GetUnitFactor(this.Unit, sResUnit, this.DPI, nToDPI);
  }

  Add(vValue, sUnit='', nDPI=-1)
  {
    if (vValue instanceof RGB_Value_C) {
      this.Value += (vValue.Value * this.GetUnitFactor(vValue.Unit, this.Unit, vValue.DPI, this.DPI));
    } else {
      this.Value += (vValue * this.GetUnitFactor(sUnit, this.Unit, nDPI, this.DPI));
    }
  }

  Sub(vValue, sUnit='', nDPI=-1)
  {
    if (vValue instanceof RGB_Value_C) {
      this.Value -= (vValue.Value * this.GetUnitFactor(vValue.Unit, this.Unit, vValue.DPI, this.DPI));
    } else {
      this.Value -= (vValue * this.GetUnitFactor(sUnit, this.Unit, nDPI, this.DPI));
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
  }
}

class RBG_ElementBase_C
{
  Name = '';
  Type = '';
  X = 0;
  Y = 0;
  Width = 0;
  Height = 0;

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