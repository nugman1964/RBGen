class RBG_BaseClass_C
{
  Owner       = null;
  #Source     = null;
  #ID         = '';
  #OnChangeCB = null;

  constructor(oOwner,sID)
  {
    this.Owner = oOwner;
    this.#ID   = sID;
  }

  get ID()
  {
    return (this.Owner ? this.Owner.ID+'.' : '') + this.#ID;
  }

  set ID(sID)
  {
    this.#ID = sID;
  }

  get OnChangeCB()
  {
    return (this.#OnChangeCB ? this.#OnChangeCB : (this.Owner ? this.Owner.OnChangeCB : null));
  }

  set OnChange(pOnChange=null)
  {
    this.#OnChangeCB = pOnChange;
  }

  get Source()  {
    console.log('[RBG_BaseClass_C] ID="'+this.ID+'", this.#Source='+this.#Source);
    console.log('[RBG_BaseClass_C] this.#Source='+(this.#Source ? 'this.#Source.Source' : 'this'));
    return (this.#Source ? this.#Source.Source : this);
  }

  set Source(oSource)
  {
    this.#Source = oSource;
  }

  get HasSource()
  {
    return (this.#Source !== null);
  }

  CallOnChange()
  {
    this.OnChangeCB(this);
  }
}

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
      this.Unit = (sUnit != '' ? sUnit : this.Unit);
      this.DPI = (nDPI > 0 ? nDPI : this.DPI);
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

class RBG_Region_C {
  
  X      = 0;
  Y      = 0;
  X1     = 0;
  Y1     = 0;
  OrgXY  = {X:0, Y:0, X1:0, Y1:0}
  Width  = 0;
  Height = 0;
  Scale  = 1.0;
  Offset = {X:0, Y:0}

  constructor(nX,nY,nX1,nY1)
  {
    this.SetXY(nX,nY,nX1,nY1);
  }

  SetXY(nX,nY,nX1,nY1)
  {
    this.OrgXY = {X:nX, Y:nY, X1:nX1, Y1:nY1}
    this.ReCalc();
  }

  SetScale(nScale)
  {
    this.Scale = nScale;
    this.ReCalc();
  }

  SetOffset(nXOfs,nYOfs)
  {
    this.Offset.X = nXOfs;
    this.Offset.Y = nYOfs;
    this.ReCalc();
  }

  ReCalc()
  {
    this.X = this.OrgXY.X * this.Scale + this.Offset.X;
    this.Y = this.OrgXY.Y * this.Scale + this.Offset.Y;
    this.X1 = this.OrgXY.X1 * this.Scale + this.Offset.X;
    this.Y1 = this.OrgXY.Y1 * this.Scale + this.Offset.Y;
    this.Width = this.X1 - this.X;
    this.Height = this.Y1 - this.Y;
  }

  toStr(nDigits=2)
  {
    return ''+this.X.toFixed(nDigits)+','+this.Y.toFixed(nDigits)+' / '+
              this.X1.toFixed(nDigits)+','+this.Y1.toFixed(nDigits)
  }

}

const RBG_RTScreen = 'screen';
const RBG_RTPDF    = 'pdf';

class RBG_Render_C {

  Options      = [];
  SelOptions   = null;
  Scale        = 1.0;
  Sheet        = null;
  SheetOffset  = {X:0, Y:0};
  Canvas       = {
                   ID:          '',
                   Width:       0,
                   Height:      0,
                   Ctx:         null,
                   SheetRegion: new RBG_Region_C(0,0,0,0),
                   DrawRegion:  new RBG_Region_C(0,0,0,0)
                 }
  ViewOptions  = {
                   ShowRulers:     false,
                   ShowScrollbars: false,
                   ShowMargins:    false
                 }

  constructor() {
    // Default options
    this.Options.push({
      ID:           'SCR-DEF',
      Name:         'Screen (default)',
      Target:       RBG_RTScreen,
      DPI:          96,
      BgColor:      "white",
      TextColor:    "black",
      Font:         "16px Arial",
      LineWidth:    1,
      Rulers:       {
                      Width:      new RBG_Value_C(22,'px',96),
                      Unit:       'mm',
                      Color:      'black',
                      BgColor:    'white',
                      Font:       '10px sans-serif'
                    },
      Scrollbars:   {
                      Color:      'darkgrey',
                      BorderColor:'#E0E0E0',
                      BgColor:    'white',
                      Width:      new RBG_Value_C(15,'px',96)
                    },
    })
    this.Options.push({
      ID:           'PDF-DEF',
      Name:         'PDF (default)',
      Target:       RBG_RTPDF,
      DPI:          300,
      BgColor:      "white",
      TextColor:    "black",
      Font:         "16px Arial",
      LineWidth:    1,
      Rulers:       {
                      Width:      new RBG_Value_C(22,'px',300),
                      Unit:       'mm',
                      Color:      'black',
                      BgColor:    'white',
                      Font:       '10px sans-serif'
                    },
      Scrollbars:   {
                      Width:      new RBG_Value_C(15,'px',300),
                      Color:      'darkgrey',
                      BorderColor:'black',
                      BgColor:    'white'
                    },
      PrintMargins: {
                      Color:      'red',
                      LineWidth:  1
                    },
      PageMargins:  {
                      Color:      'green',
                      LineWidth:  1
                    }
    })
    this.Scale = 1.0;
    this.SheetOffset = {X:0, Y:0};
  }

  SelectTarget(sTarget) {
    this.SelOptions = null;
    for (var i = 0; i < this.Options.length; i++)
      if (this.Options[i].Target == sTarget)
        this.SelOptions = this.Options[i];
  } 
  
  SetScale(nScale)
  {
    this.Scale = nScale;
  }

  SetSheet(oSheet)
  {
    this.Sheet = oSheet;
  }

  SetSheetOffset(nXOffset, nYOffset)
  {
    this.SheetOffset.X = nXOffset;
    this.SheetOffset.Y = nYOffset;
  }

  SetRulersON(bRulersON)
  {
    this.ViewOptions.ShowRulers = bRulersON;
    console.log('[RBG_Render_C] bRulersON='+bRulersON);
    console.log('[RBG_Render_C] this.SelOptions.Ruler.Show='+this.ViewOptions.ShowRulers);
  }

  GetRulersON()
  {
    return this.ViewOptions.ShowRulers;
  }

  SetScrollbarsON(bScrollbarsON)
  {
    this.ViewOptions.ShowScrollbars = bScrollbarsON;
  }

  GetScrollbarsON()
  {
    return this.ViewOptions.ShowScrollbars;
  }

  SetCanvas(sCanvasID,bResizeCanvas=true)
  {
    this.Canvas.ID = sCanvasID;
    var eCanvas = document.getElementById(sCanvasID);
    if (eCanvas && this.SelOptions) {
      console.log('[RBG_Render_C] eCanvas.width='+eCanvas.width);
      console.log('[RBG_Render_C] eCanvas.height='+eCanvas.height);
      console.log('[RBG_Render_C] eCanvas.clientWidth='+eCanvas.clientWidth);
      console.log('[RBG_Render_C] eCanvas.clientHeight='+eCanvas.clientHeight);
      var SO = this.SelOptions;
      var VO = this.ViewOptions;
      // Get dimensions of rulers, scrollbars and sheet in px
      var nRulerWidthPX = SO.Rulers.Width.toUnit('px',SO.DPI);
      nRulerWidthPX = (VO.ShowRulers ? nRulerWidthPX : 0);
      var nScrollbarWidthPX = SO.Scrollbars.Width.toUnit('px',SO.DPI);
      nScrollbarWidthPX = (VO.ShowScrollbars ? nScrollbarWidthPX : 0);
      var nSheetWidthPX = this.Sheet.GetWidth('px',SO.DPI);
      var nSheetHeightPX = this.Sheet.GetHeight('px',SO.DPI);
      console.log('[RBG_Render_C] nSheetWidthPX='+nSheetWidthPX);
      console.log('[RBG_Render_C] nSheetHeightPX='+nSheetHeightPX);
      if (bResizeCanvas) {
        this.Canvas.Width  = nRulerWidthPX + nScrollbarWidthPX + nSheetWidthPX;
        this.Canvas.Height = nRulerWidthPX + nScrollbarWidthPX + nSheetHeightPX;
        this.Canvas.SheetRegion.SetXY(nRulerWidthPX, nRulerWidthPX,
                                      this.Canvas.Width-nScrollbarWidthPX,
                                      this.Canvas.Height-nScrollbarWidthPX);
        eCanvas.width  = this.Canvas.Width * this.Scale;
        eCanvas.height = this.Canvas.Height * this.Scale;
      } else {
        // Calculate scale to fit the complete page into given canvas.
        this.Canvas.Width  = eCanvas.clientWidth;
        this.Canvas.Height = eCanvas.clientHeight;
        var nWidthScale = (this.Canvas.Width - nRulerWidthPX - nScrollbarWidthPX) / nSheetWidthPX;
        var nHeightScale = (this.Canvas.Height - nRulerWidthPX - nScrollbarWidthPX) / nSheetHeightPX;
        this.Scale = (nWidthScale < nHeightScale ? nWidthScale : nHeightScale);
        console.log('[RBG_Render_C] this.Scale='+this.Scale);
        nSheetWidthPX = nSheetWidthPX * this.Scale;
        nSheetHeightPX = nSheetHeightPX * this.Scale;
        console.log('[RBG_Render_C] nSheetWidthPX='+nSheetWidthPX);
        console.log('[RBG_Render_C] nSheetHeightPX='+nSheetHeightPX);
        this.Canvas.SheetRegion.SetXY((this.Canvas.Width+nRulerWidthPX-nScrollbarWidthPX-nSheetWidthPX)/2,
                                      (this.Canvas.Height+nRulerWidthPX-nScrollbarWidthPX-nSheetHeightPX)/2,
                                      (this.Canvas.Width+nRulerWidthPX-nScrollbarWidthPX+nSheetWidthPX)/2,
                                      (this.Canvas.Height+nRulerWidthPX-nScrollbarWidthPX+nSheetHeightPX)/2);
      }
      // Get draw region of canvas (area of canvas minus rulers and scrollbars)
      this.Canvas.DrawRegion.SetXY(nRulerWidthPX, nRulerWidthPX,
                                   this.Canvas.Width-nScrollbarWidthPX,
                                   this.Canvas.Height-nScrollbarWidthPX);
      var SR = this.Canvas.SheetRegion;
      console.log('[RBG_Render_C] this.Canvas.SheetRegion = '+SR.toStr());
      this.Canvas.Ctx = eCanvas.getContext("2d");
      this.Canvas.Ctx.fillStyle = SO.BgColor;
      this.Canvas.Ctx.fillRect(0, 0, eCanvas.clientWidth, eCanvas.clientHeight);
      this.RenderRulers();
      this.RenderScrollbars();
    } else {
      console.warn('[RBG_Render_C] SetScreenCanvas() Canvas with ID "'+sCanvasID+'" not found !!!');
    }
  }

  RenderRulers()
  {
    var SO = this.SelOptions;
    if (this.ViewOptions.ShowRulers) {
      var ctx = this.Canvas.Ctx;
      ctx.strokeStyle   = SO.Rulers.Color;
      ctx.lineWidth     = 1;
      ctx.font          = SO.Rulers.Font;
      ctx.fillStyle     = SO.Rulers.Color;
      ctx.textAlign     = 'left';
      ctx.textBaseline  = 'top';
      var nRulerWidthPX = SO.Rulers.Width.toUnit('px',SO.DPI);
      var nSheetWidth   = this.Sheet.GetWidth('mm');
      var nSheetHeight  = this.Sheet.GetHeight('mm');
      console.log('[RBG_DocPage_C] Render Ruler Top (0/'+nRulerWidthPX+')'+
                                               ' => ('+this.Canvas.Width+'/'+nRulerWidthPX+')');
      ctx.beginPath();
      ctx.moveTo(0,                 Math.round(nRulerWidthPX)-0.5);
      ctx.lineTo(this.Canvas.Width, Math.round(nRulerWidthPX)-0.5);
      var nRulerLineX = new RBG_Value_C(0.0,'mm');
      while (nRulerLineX.Value < nSheetWidth) {
        var nRulerLineXPX = this.Canvas.SheetRegion.X + nRulerLineX.toUnit('px',SO.DPI) * this.Scale;
        var nRulerLineY1PX = ((Math.trunc(nRulerLineX.Value) % 10) == 0 ? 0 : nRulerWidthPX / 2);
        var nRulerLineY2PX = nRulerWidthPX;
        ctx.moveTo(Math.round(nRulerLineXPX)-0.5, Math.round(nRulerLineY1PX));
        ctx.lineTo(Math.round(nRulerLineXPX)-0.5, Math.round(nRulerLineY2PX));
        nRulerLineX.Add(1.0);
      }
      ctx.stroke();
      var nRulerTextX = new RBG_Value_C(0.0,'mm');
      while (nRulerTextX.Value < nSheetWidth) {
        var nRulerTextXPX = this.Canvas.SheetRegion.X + nRulerTextX.toUnit('px',SO.DPI) * this.Scale;
        ctx.fillText(Math.trunc(nRulerTextX.Value), nRulerTextXPX+2, 0);
        nRulerTextX.Add(10.0);
      }
      console.log('[RBG_DocPage_C] Render Ruler Left ('+nRulerWidthPX+'/0)'+
                                                ' => ('+nRulerWidthPX+'/'+this.Canvas.Height+')');
      ctx.beginPath();
      ctx.moveTo(Math.round(nRulerWidthPX)-0.5, 0);
      ctx.lineTo(Math.round(nRulerWidthPX)-0.5, this.Canvas.Height);
      var nRulerLineY = new RBG_Value_C(1.0,'mm');
      while (nRulerLineY.Value < nSheetHeight) {
        var nRulerLineYPX = this.Canvas.SheetRegion.Y + nRulerLineY.toUnit('px',SO.DPI) * this.Scale;
        var nRulerLineX1PX = ((Math.trunc(nRulerLineY.Value) % 10) == 0 ? 0 : nRulerWidthPX / 2);
        var nRulerLineX2PX = nRulerWidthPX;
        ctx.moveTo(Math.round(nRulerLineX1PX), Math.round(nRulerLineYPX)-0.5);
        ctx.lineTo(Math.round(nRulerLineX2PX), Math.round(nRulerLineYPX)-0.5);
        nRulerLineY.Add(1.0);
      }
      ctx.stroke();
      var nRulerTextY = new RBG_Value_C(0.0,'mm');
      while (nRulerTextY.Value < nSheetHeight) {
        var nRulerTextYPX = this.Canvas.SheetRegion.Y + nRulerTextY.toUnit('px',SO.DPI) * this.Scale;
        ctx.rotate(-Math.PI / 2); // Rotate context for vertical text
        ctx.translate(-nRulerTextYPX-2, 0);
        ctx.textAlign = 'right';
        ctx.fillText(Math.trunc(nRulerTextY.Value), 0, 0);
        ctx.resetTransform(); // Reset rotation and translation
        nRulerTextY.Add(10.0);
      }
    }
  }

  RenderScrollbars()
  {
    var SO = this.SelOptions;
    if (this.ViewOptions.ShowScrollbars) {
      var ctx = this.Canvas.Ctx;
      ctx.fillStyle = SO.Scrollbars.Color;
      var nScrollbarWidthPX = SO.Scrollbars.Width.toUnit('px',SO.DPI);

      console.log('[RBG_DocPage_C] Render scrollbar bottom (0/'+(this.Canvas.Height-nScrollbarWidthPX)+')'+
                  ' => ('+this.Canvas.Width+'/'+(this.Canvas.Height-nScrollbarWidthPX)+')');

      ctx.fillStyle = SO.Scrollbars.BgColor;
      ctx.fillRect(Math.round(this.Canvas.SheetRegion.X),
                   Math.round(this.Canvas.Height-nScrollbarWidthPX),
                   Math.round(this.Canvas.SheetRegion.Width-1),
                   Math.round(nScrollbarWidthPX)-1);
      ctx.strokeStyle = SO.Scrollbars.BorderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(this.Canvas.DrawRegion.X),Math.round(this.Canvas.DrawRegion.Y1)+0.5);
      ctx.lineTo(Math.round(this.Canvas.DrawRegion.X1),Math.round(this.Canvas.DrawRegion.Y1)+0.5);
      ctx.stroke();
      ctx.fillStyle = SO.Scrollbars.Color;
      ctx.fillRect(Math.round(this.Canvas.SheetRegion.X+2),
                   Math.round(this.Canvas.Height-nScrollbarWidthPX+2),
                   Math.round(this.Canvas.SheetRegion.Width-4),
                   Math.round(nScrollbarWidthPX-3));

      console.log('[RBG_DocPage_C] Render scrollbar right ('+(this.Canvas.Width-nScrollbarWidthPX)+'/0)'+
                  ' => ('+(this.Canvas.Width-nScrollbarWidthPX)+'/'+this.Canvas.Height+')');
      ctx.fillStyle = SO.Scrollbars.BgColor;
      ctx.fillRect(Math.round(this.Canvas.Width-nScrollbarWidthPX),
                   Math.round(this.Canvas.SheetRegion.Y),
                   Math.round(nScrollbarWidthPX)-1,
                   Math.round(this.Canvas.SheetRegion.Height)-1);
      ctx.strokeStyle = SO.Scrollbars.BorderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(this.Canvas.DrawRegion.X1)+0.5,Math.round(this.Canvas.DrawRegion.Y));
      ctx.lineTo(Math.round(this.Canvas.DrawRegion.X1)+0.5,Math.round(this.Canvas.DrawRegion.Y1));
      ctx.stroke();
      ctx.fillStyle = SO.Scrollbars.Color;
      ctx.fillRect(Math.round(this.Canvas.Width-nScrollbarWidthPX+2),
                   Math.round(this.Canvas.SheetRegion.Y+2),
                   Math.round(nScrollbarWidthPX-3),
                   Math.round(this.Canvas.SheetRegion.Height-4));
      // Fill right/bottom corner
      ctx.fillStyle = SO.Scrollbars.BorderColor;
      ctx.fillRect(Math.round(this.Canvas.DrawRegion.X1),
                   Math.round(this.Canvas.DrawRegion.Y1),
                   Math.round(this.Canvas.Width),
                   Math.round(this.Canvas.Height));
    }
  }

}

class RBG_Margins_C extends RBG_BaseClass_C {

  #Top    = new RBG_Value_C(25,'mm');
  #Right  = new RBG_Value_C(25,'mm');
  #Bottom = new RBG_Value_C(20,'mm');
  #Left   = new RBG_Value_C(25,'mm');
  RenderProgress = RBG_RPNotStarted;

  constructor(oOwner,oSource,nTop=25,nRight=25,nBottom=20,nLeft=25,sUnit='mm',nDPI=-1)
  {
    super(oOwner,'Mar');
    this.Set(oSource,nTop,nRight,nBottom,nLeft,sUnit,nDPI);
  }

  Set(oSource,nTop=25,nRight=25,nBottom=20,nLeft=25,sUnit='mm',nDPI=-1)
  {
    this.Source = oSource;
    if (!oSource) {
      this.#Top.Set(nTop,sUnit,nDPI);
      this.#Right.Set(nRight,sUnit,nDPI);
      this.#Bottom.Set(nBottom,sUnit,nDPI);
      this.#Left.Set(nLeft,sUnit,nDPI);
    }
  }

  get Top()     { return (this.HasSource ? this.Source.Top : this.#Top); }
  get Right()   { return (this.HasSource ? this.Source.Right : this.#Right); }
  get Bottom()  { return (this.HasSource ? this.Source.Bottom : this.#Bottom); }
  get Left()    { return (this.HasSource ? this.Source.Left : this.#Left); }

  Render(oRender)
  {
    this.RenderProgress = RBG_RPOngoing;
    var SO = oRender.SelOptions;
    ctx.strokeStyle = SO.PageMargins.Color;
    ctx.lineWidth   = SO.PageMargins.LineWidth;
    ctx.beginPath();
    var X = oRender.Sheet.PrintMargin.Left.toUnit('px',SO.DPI)+this.Left.toUnit('px',SO.DPI);
    var Y = oRender.Sheet.PrintMargin.Top.toUnit('px',SO.DPI)+this.Top.toUnit('px',SO.DPI);
    var X1 = oRender.Sheet.PageFormat.Width.toUnit('px',SO.DPI)-this.Right.toUnit('px',SO.DPI);
    var Y1 = oRender.Sheet.PageFormat.Height.toUnit('px',SO.DPI)-this.Bottom.toUnit('px',SO.DPI);
    ctx.moveTo(oRender.SheetRegion.X,Math.round(Y));
    ctx.lineTo(oRender.SheetRegion.X1,Math.round(Y));
    ctx.moveTo(Math.round(X1),oRender.SheetRegion.Y);
    ctx.lineTo(Math.round(X1),oRender.SheetRegion.Y1);
    ctx.moveTo(oRender.SheetRegion.X,Math.round(Y1));
    ctx.lineTo(oRender.SheetRegion.X1,Math.round(Y1));
    ctx.moveTo(Math.round(X),oRender.SheetRegion.Y);
    ctx.lineTo(Math.round(X),oRender.SheetRegion.Y1);
    ctx.stroke();
    this.RenderProgress = RBG_RPFinished;
  }

}

class RBG_Sheet_C extends RBG_BaseClass_C {

  PageFormat   = null;
  PrintMargin  = null;
  Pages        = 2;

  constructor(oOwner,sPageFormat='A4',nWidth=0,nHeight=0,sUnit='')
  {
    super(oOwner,'Sh');
    this.PageFormat = {Width: new RBG_Value_C(210.0,'mm'),
                       Height: new RBG_Value_C(297.0,'mm')}
    this.SetPageFormat(sPageFormat, nWidth, nHeight, sUnit);
    this.PrintMargin = new RBG_Margins_C(this,null,0.0,0.0,0.0,0.0,'mm');
  }

  SetPageFormat(sPageFormat, nWidth, nHeight, sUnit)
  {
    if (sPageFormat == 'A4') {
      this.PageFormat.Width.Set(210.0,'mm');
      this.PageFormat.Height.Set(297.0,'mm');
    } else if (sPageFormat == 'A3') {
      this.PageFormat.Width.Set(297.0,'mm');
      this.PageFormat.Height.Set(420.0,'mm');
    } else if (sPageFormat == 'A5') {
      this.PageFormat.Width.Set(148.0,'mm');
      this.PageFormat.Height.Set(210.0,'mm');
    } else if ((sPageFormat == '') && (nWidth > 0) && (nHeight > 0) && (sUnit != '')) {
      this.PageFormat.Width.Set(nWidth,sUnit);
      this.PageFormat.Height.Set(nHeight,sUnit);
    } else {
      console.warn('[RBG_Sheet_C] SetPageFormat() Unknown page format "'+sPageFormat+'" '+
                   'or parameter missing !!!');
    }
  }

  GetWidth(sUnit='mm',nToDPI=-1) {
    var vWidth = new RBG_Value_C(this.PageFormat.Width);
    vWidth.Add(this.PrintMargin.Left);
    vWidth.Add(this.PrintMargin.Right);
    vWidth.ChangeUnit(sUnit,nToDPI);
    console.log('[RBG_Sheet_C] GetSheetWidth() ='+vWidth.toString());
    return vWidth.Value;
  }

  GetHeight(sUnit='mm',nToDPI=-1) {
    var vHeight = new RBG_Value_C(this.PageFormat.Height);
    vHeight.Add(this.PrintMargin.Top);
    vHeight.Add(this.PrintMargin.Bottom);
    vHeight.ChangeUnit(sUnit,nToDPI);
    console.log('[RBG_Sheet_C] GetSheetHeight() ='+vHeight.toString());
    return vHeight.Value;
  }

}

class RBG_Document_C extends RBG_BaseClass_C {

  DocumentID   = '';
  DocumentName = '';
  Sections     = null;
  Sheet        = null;
  Margins      = null;
  Background   = null;
  Header       = null;
  Footer       = null;
  RenderData   = null;

  constructor(sID,sName)
  {
    super(null,'Doc['+sID+']');
    this.DocumentID   = sID;
    this.DocumentName = sName;
    this.Background = new RBG_Elements_C(this);
    this.Header = new RBG_Elements_C(this);
    this.Footer = new RBG_Elements_C(this);
    this.Sections = new RBG_DocSections_C(this);
    this.Sections.Add('CoverFront',2);
    this.Sections.Add('Content',4);
    this.Sections.Add('CoverBack',2);
    this.Margins = new RBG_Margins_C(this,null,25.0,25.0,20.0,25.0,'mm');
  }

  SetSheet(oSheet)
  {
    this.Sheet = oSheet;
  }

  Render(oRender,nPageNr)
  {
    console.log('[RBG_Document_C] Render() oRender.Canvas.ID='+oRender.Canvas.ID);
    oRender.SetSheet(this.Sheet);
    var oSection = this.Sections.GetByPageNr(nPageNr);
    var nSectionPageNr = nPageNr-oSection.PageNrStart;
    var oPage = oSection.GetPage(nSectionPageNr);
    oPage.Render(oRender);
    oRender.Canvas.Ctx.restore();
  }

}

class RBG_DocSections_C extends RBG_BaseClass_C {

  Sections = [];

  constructor(oDocument)
  {
    super(oDocument,'Secs');
  }

  get Document() { return this.Owner; }

  Add(sID,nMinPages=2)
  {
    var oDocSection = new RBG_DocSection_C(this,sID);
    console.log('this.Sections.length = '+this.Sections.length);
    var oLastSection = this.Sections.at(-1);
    var nSectionPageNrStart = (oLastSection ? oLastSection.PageNrStart+oLastSection.Pages.length : 1);
    this.Sections.push(oDocSection);
    oDocSection.PageNrStart = nSectionPageNrStart;
    for (var i = 0; i < nMinPages; i++)
      oDocSection.AddPage();
    return oDocSection;
  }

  GetByID(sID)
  {
    var oSection = null;
    for (var i = 0; i < this.Sections.length; i++) {
      if (this.Sections[i].SectionID == sID)
        oSection = this.Sections[i];
    }
    return oSection;
  }

  GetByPageNr(nPageNr)
  {
    var oSection = null;
    for (var i = 0; i < this.Sections.length; i++) {
      var nStartPageNr = this.Sections[i].PageNrStart;
      var nEndPageNr = this.Sections[i].PageNrStart + this.Sections[i].Pages.length-1;
      if ((nPageNr >= nStartPageNr) && (nPageNr <= nEndPageNr))
        oSection = this.Sections[i];
    }
    return oSection;
  }
}

class RBG_DocSection_C extends RBG_BaseClass_C {

  SectionID   = '';
  Background  = null;
  Header      = null;
  Footer      = null;
  Content     = null;
  Margins     = null;
  PageNrStart = 1;
  Pages       = [];

  constructor(oSections,sID)
  {
    super(oSections,'Sec['+sID+']')
    this.SectionID  = sID;
    this.Background = new RBG_Elements_C(this,this.Sections.Document.Background);
    this.Header     = new RBG_Elements_C(this,this.Sections.Document.Header);
    this.Footer     = new RBG_Elements_C(this,this.Sections.Document.Footer);
    this.Content    = new RBG_Elements_C(this);
    this.Margins    = new RBG_Margins_C(this,this.Sections.Document);
  }

  get Sections() { return this.Owner; }

  AddPage()
  {
    var oPageData = new RBG_DocPage_C(this,this.Pages.length);
    this.Pages.push(oPageData);
    return oPageData;    
  }

  GetPage(nSectionPageNr)
  {
    for (var i = 0; i < this.Pages.length; i++) {
      if (this.Pages[i].PageNr == nSectionPageNr)
        return this.Pages[i];
    }
    return null;
  }

}

class RBG_DocPage_C extends RBG_BaseClass_C {

  PageNr           = 0;
  Background       = null;
  Header           = null;
  Footer           = null;
  Content          = null;
  Margins          = null;
  RenderData       = null;
  RenderFinishedCB = null;

  constructor(oSection,nSectionPageNr)
  {
    super(oSection,'Pg['+nSectionPageNr+']');
    this.PageNr     = nSectionPageNr;
    this.Background = new RBG_Elements_C(this,this.Section.Background);
    this.Header     = new RBG_Elements_C(this,this.Section.Header);
    this.Footer     = new RBG_Elements_C(this,this.Section.Footer);
    this.Content    = new RBG_Elements_C(this,this.Section.Content);
    this.Margins    = new RBG_Margins_C(this,this.Section);
  }

  get Section() { return this.Owner; }

  Render(oRender=null, pRenderFinishedCB=null)
  {
    if (oRender) {
      this.RenderData = oRender;
      this.RenderFinishedCB = pRenderFinishedCB;
      this.Background.RenderProgress = RBG_RPNotStarted;
      this.Header.RenderProgress = RBG_RPNotStarted;
      this.Footer.RenderProgress = RBG_RPNotStarted;
      this.Content.RenderProgress = RBG_RPNotStarted;
      this.Margins.RenderProgress = RBG_RPNotStarted;
    }
    if (this.Background.RenderProgress == RBG_RPNotStarted)
      this.Background.Render(this.RenderData);
    if ((this.Header.RenderProgress == RBG_RPNotStarted) &&
        (this.Background.RenderProgress == RBG_RPFinished))
      this.Header.Render(this.RenderData);
    if ((this.Footer.RenderProgress == RBG_RPNotStarted) &&
        (this.Header.RenderProgress == RBG_RPFinished))
      this.Footer.Render(this.RenderData);
    if ((this.Content.RenderProgress == RBG_RPNotStarted) &&
        (this.Footer.RenderProgress == RBG_RPFinished))
      this.Content.Render(this.RenderData);
    if ((this.Margins.RenderProgress == RBG_RPNotStarted) &&
        (this.Content.RenderProgress == RBG_RPFinished)) {
      if (this.RenderData.ViewOptions.ShowMargins)
        this.Margins.Render(this.RenderData);
      else
        this.Margins.RenderProgress = RBG_RPFinished;
    }
    if (this.Margins.RenderProgress != RBG_RPFinished) {
      // Try again in 50ms
      setTimeout(this.Render.bind(this), 50);
    } else {
      if (this.RenderFinishedCB)
        this.RenderFinishedCB(this);
    }
  }

}

const RBG_ETRect  = 'rect';
const RBG_ETText  = 'text';
const RBG_ETImage = 'image';
const RBG_RPNotStarted = 0;
const RBG_RPOngoing    = 1;
const RBG_RPFinished   = 2;

class RBG_Elements_C extends RBG_BaseClass_C
{

  #Elements      = [];
  RenderData     = null;
  RenderProgress = RBG_RPNotStarted;

  constructor(oOwner,oSource=null)
  {
    super(oOwner,'Els');
    this.Source = oSource;
  }

  get Elements() { return (this.HasSource ? this.Source.Elements : this.#Elements); }

  Add(sType, sName, X, Y, Width, Height, sUnit='mm')
  {
    console.log('[RBG_Elements_C] Add(sType='+sType+', sName='+sName+', X='+X+', Y='+Y+', Width='+Width+', Height='+Height+', sUnit='+sUnit+')');
    var oElement = null;
    switch (sType) {
      case RBG_ETRect:
        oElement = new RBG_ElementRect_C(this,sName,X,Y,Width,Height,sUnit);
        break;
      case RBG_ETText:
        oElement = new RBG_ElementText_C(this,sName,X,Y,Width,Height,sUnit);
        break;
      case RBG_ETImage:
        oElement = new RBG_ElementImage_C(this,sName,X,Y,Width,Height,sUnit);
        break;
      default:
        console.warn('[RBG_Elements_C] Add() Unknown type "'+sType+'"!!!')
        break;
    }
    this.Source = null;
    this.#Elements.push(oElement);
    console.log('[RBG_Elements_C] Add() ID='+this.ID+'; this.Elements.length='+this.#Elements.length);
    return oElement;
  }

  Clear()
  {
    this.Source = null;
    this.#Elements = [];
  }

  Render(oRender=null)
  {
    if (oRender) {
      this.RenderData = oRender;
      this.RenderProgress = RBG_RPOngoing;
      console.log('[RBG_Elements_C] Render() oRender.Canvas.ID='+oRender.Canvas.ID);
      console.log('[RBG_Elements_C] Render() ID='+this.ID+'; this.Elements.length='+this.Elements.length);
    }
    console.log('[RBG_Elements_C] Render() this.RenderData.Canvas.ID='+this.RenderData.Canvas.ID);
    console.log('[RBG_Elements_C] Render() this.RenderData.Canvas.Ctx.canvas.id='+this.RenderData.Canvas.Ctx.canvas.id);
    // Check that all elements are ready for rendering
    var nElementsReady = 0;
    for (var i = 0; i < this.Elements.length; i++) {
      nElementsReady += (this.Elements[i].IsReadyForRender() ? 1 : 0)
    }
    console.log('[RBG_Elements_C] Render() ID='+this.ID+'; ElementsReady = ' + nElementsReady + ' of ' + this.Elements.length);
    if (nElementsReady == this.Elements.length) {
      var RD = this.RenderData;
      console.log('[RBG_Elements_C] Render() RD.Canvas.SheetRegion: '+RD.Canvas.SheetRegion.toStr());
      console.log('[RBG_Elements_C] Render() RD.Scale: '+RD.Scale.toFixed(3));
      RD.Canvas.Ctx.save();
      RD.Canvas.Ctx.beginPath();
      RD.Canvas.Ctx.rect(RD.Canvas.SheetRegion.X, RD.Canvas.SheetRegion.Y,
                         RD.Canvas.SheetRegion.Width, RD.Canvas.SheetRegion.Height);
      RD.Canvas.Ctx.clip();
      RD.Canvas.Ctx.setTransform(RD.Scale, 0, 0, RD.Scale,
                                 RD.Canvas.SheetRegion.X, RD.Canvas.SheetRegion.Y);
      // Render all elements
      for (var i = 0; i < this.Elements.length; i++) {
        this.Elements[i].Render(RD);
      }
      RD.Canvas.Ctx.resetTransform();
      RD.Canvas.Ctx.restore();
      this.RenderProgress = RBG_RPFinished;
    } else {
      // Try again in 50ms
      setTimeout(this.Render.bind(this), 50);
    }
  }
}

class RBG_ElementFilters_C extends RBG_BaseClass_C
{
  Opacity    = 100;
  Brightness = 100;
  Contrast   = 100;
  DropShadow = {Blur: 0, Color: 'black', OffsetX: 0, OffsetY: 0};
  Grayscale  = 0;
  HueRotate  = 0;
  Invert     = 0;
  Saturate   = 100;
  Sepia      = 0;

  constructor(oOwner,oElementFilters=null)
  {
    super(oOwner,'Fi');
    this.Reset();
    if (oElementFilters instanceof RBG_ElementFilters_C) {
      this.Opacity    = oElementFilters.Opacity;
      this.Brightness = oElementFilters.Brightness;
      this.Contrast   = oElementFilters.Contrast;
      this.DropShadow = Object.assign({}, oElementFilters.DropShadow);
      this.Grayscale  = oElementFilters.Grayscale;
      this.HueRotate  = oElementFilters.HueRotate;
      this.Invert     = oElementFilters.Invert;
      this.Saturate   = oElementFilters.Saturate;
      this.Sepia      = oElementFilters.Sepia;
    }
  }

  Reset()
  {
    this.Opacity    = 100;
    this.Brightness = 100;
    this.Contrast   = 100;
    this.DropShadow = {Blur: 0, Color: 'black', OffsetX: 0, OffsetY: 0};
    this.Grayscale  = 0;
    this.HueRotate  = 0;
    this.Invert     = 0;
    this.Saturate   = 100;
    this.Sepia      = 0;
  }

  SetOpacity(nOpacity)
  {
    this.Opacity = nOpacity;
  }

  SetBrightness(nBrightness)
  {
    this.Brightness = nBrightness;
  }

  SetContrast(nContrast)
  {
    this.Contrast = nContrast;
  }

  SetDropShadow(nBlur, sColor, nOffsetX, nOffsetY)
  {
    this.DropShadow.Blur = nBlur;
    this.DropShadow.Color = sColor;
    this.DropShadow.OffsetX = nOffsetX;
    this.DropShadow.OffsetY = nOffsetY;
  }

  SetGrayscale(nGrayscale)
  {
    this.Grayscale = nGrayscale;
  }

  SetHueRotate(nHueRotate)
  {
    this.HueRotate = nHueRotate;
  }

  SetInvert(nInvert)
  {
    this.Invert = nInvert;
  }

  SetSaturate(nSaturate)
  {
    this.Saturate = nSaturate;
  }

  SetSepia(nSepia)
  {
    this.Sepia = nSepia;
  }

  toCtx(ctx)
  {
    var sFilter = (this.Opacity != 100 ? 'opacity('+this.Opacity+'%) ' : '') +
                  (this.Brightness != 100 ? 'brightness('+this.Brightness+'%) ' : '') +
                  (this.Contrast != 100 ? 'contrast('+this.Contrast+'%) ' : '') +
                  (this.DropShadow.Blur > 0 ? 'drop-shadow('+this.DropShadow.OffsetX+'px '+
                                                             this.DropShadow.OffsetY+'px '+
                                                             this.DropShadow.Blur+'px '+
                                                             this.DropShadow.Color+') ' : '') +
                  (this.Grayscale > 0 ? 'grayscale('+this.Grayscale+'%) ' : '') +
                  (this.HueRotate != 0 ? 'hue-rotate('+this.HueRotate+'deg) ' : '') +
                  (this.Invert > 0 ? 'invert('+this.Invert+'%) ' : '') +
                  (this.Saturate != 100 ? 'saturate('+this.Saturate+'%) ' : '') +
                  (this.Sepia > 0 ? 'sepia('+this.Sepia+'%) ' : '');
    ctx.filter = sFilter.trim();
    console.log('[RBG_ElementFilters_C of "'+this.Owner.Name+'"] toCtx() filter = ' + sFilter);
  }
}

class RBG_ElementBase_C extends RBG_BaseClass_C
{

  Name      = '';
  Type      = '';
  X         = null;
  Y         = null;
  Width     = null;
  Height    = null;
  CanRender = false;

  constructor(oOwner,sType,sName,X,Y,Width,Height,sUnit='mm')
  {
    super(oOwner,'El')
    console.log('[RBG_ElementBase_C] new(oOwner, sType='+sType+', sName='+sName+', X='+X+', Y='+Y+', Width='+Width+', Height='+Height+', sUnit='+sUnit+')');
    this.type   = sType;
    this.Name   = sName;
    this.X      = new RBG_Value_C(X, sUnit);
    this.Y      = new RBG_Value_C(Y, sUnit);
    this.Width  = new RBG_Value_C(Width, sUnit);
    this.Height = new RBG_Value_C(Height, sUnit);
  }

  IsReadyForRender()
  {
    return this.CanRender;
  }

  Render(oRender)
  {
    console.warn('[RBG_ElementBase_C] Render() not implemented for type: ' + this.type);
  }
}

class RBG_ElementRect_C extends RBG_ElementBase_C
{
  FillColor   = '';
  StrokeColor = '';
  StrokeWidth = new RBG_Value_C(1,'px');
  Filters     = null;
  BlendMode   = 'source-over';

  constructor(oOwner, sName, X, Y, Width, Height, sUnit='mm')
  {
    super(oOwner,RBG_ETRect, sName, X, Y, Width, Height, sUnit);
    console.log('[RBG_ElementRect_C] new(oOwner, sName='+sName+', X='+X+', Y='+Y+', Width='+Width+', Height='+Height+', sUnit='+sUnit+')');
    this.Filters   = new RBG_ElementFilters_C(this);
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

  SetBlendMode(sBlendMode)
  {
    this.BlendMode = (sBlendMode == '' ? 'source-over' : sBlendMode);
  }

  Render(oRender)
  {
    var ctx = oRender.Canvas.Ctx;
    ctx.save();
    this.Filters.toCtx(ctx);
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
  Filters        = null;
  BlendMode      = 'source-over';

  constructor(oOwner, sName, X, Y, Width, Height, sUnit='mm')
  {
    super(oOwner, RBG_ETText, sName, X, Y, Width, Height, sUnit);
    this.Filters   = new RBG_ElementFilters_C(this);
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

  SetBlendMode(sBlendMode)
  {
    this.BlendMode = (sBlendMode == '' ? 'source-over' : sBlendMode);
  }

  Render(oRender)
  {
    var ctx = oRender.Canvas.Ctx;
    ctx.save();
    this.Filters.toCtx(ctx);
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
  Filters     = null;
  BlendMode   = 'source-over';
  ImageObject = null;
  ImageLoaded = false;

  constructor(oOwner, sName, X, Y, Width, Height, sUnit='mm')
  {
    super(oOwner, RBG_ETImage, sName, X, Y, Width, Height, sUnit);
    this.Filters   = new RBG_ElementFilters_C(this);
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

  SetBlendMode(sBlendMode)
  {
    this.BlendMode = (sBlendMode == '' ? 'source-over' : sBlendMode);
  }

  ImageOnLoadCB()
  {
    this.ImageLoaded = true;
    this.CanRender = true;
    console.log('[RBG_ElementImage_C] Image loaded: ' + this.Filename);
  }

  Render(oRender)
  {
    var ctx = oRender.Canvas.Ctx;
    ctx.save();
    this.Filters.toCtx(ctx);
    ctx.globalCompositeOperation = this.BlendMode;
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
