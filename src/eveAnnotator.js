class EveAnnotator{
  constructor(iframe) {
    this.win = iframe.window;
    this.doc = iframe.document;
    this.doClick = null;

    // init
    this.createPopover();
    this.doc.onmouseup = this.showPopover.bind(this);

    let circle = this.doc.getElementsByClassName('eve-popover-circle')
    for (let i = 0; i < circle.length; i++) {
      circle[i].addEventListener('click', () => {
        this.doClick();
      });
    }
  }

  createPopover() {
    let evePopoverWrapper = this.doc.createElement('div');
    evePopoverWrapper.setAttribute("id", "eve-popover-wrapper");
    evePopoverWrapper.style.display = "none";
    evePopoverWrapper.style.cssText = `
      position: fixed;
      width: 124px;
      padding: 2px;
      background-repeat: repeat-x;
      background: #FFF;
      border: 1px solid #c5c5c5;
      box-shadow: rgba(0, 0, 0, 0.3) 0 2px 12px 1px;
      border-radius: 5px;
    `
    this.doc.body.appendChild(evePopoverWrapper);

    let evePopoverCircleList = this.doc.createElement('div');
    evePopoverCircleList.setAttribute("class", "eve-popover-circle-list");
    evePopoverCircleList.style.cssText = `
      margin: 2px;
    `
    evePopoverWrapper.appendChild(evePopoverCircleList);

    let evePopoverCircle = this.doc.createElement('div');
    evePopoverCircle.setAttribute("class", "eve-popover-circle");
    evePopoverCircle.style.cssText = `
      cursor: pointer;
      vertical-align: middle;
      border-radius: 50%;
      border: 1px solid;
      width: 20px;
      height: 20px;
      opacity: 1;
      box-sizing: border-box;
      background-color: rgb(255, 202, 215); 
      border-color: rgb(242, 192, 204);
    `
    evePopoverCircleList.appendChild(evePopoverCircle);
  }

  showPopover(e) {
    e.preventDefault();
    const selection = this.win.getSelection()
    const firstRange = selection.getRangeAt(0)
    const rect = firstRange.getBoundingClientRect()

    const popover = this.doc.getElementById('eve-popover-wrapper');
    popover.style.display = !selection.isCollapsed ? 'block' : 'none'

    // show it at bottom center of selection
    popover.style.left = rect.left + rect.width / 2 - 65 + 'px' // "minus, popover.width 130 / 2"
    popover.style.top = rect.bottom + 5 + 'px'
  }
}

export default EveAnnotator;
