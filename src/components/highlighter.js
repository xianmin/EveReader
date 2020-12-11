export default { 
  highlight(range, style='', cb) {
    let element = document.createElement('eve-highlight');
    range.surroundContents(element);
    element.setAttribute('style', style);

    if (cb) {
      element.addEventListener("click", cb);
      element.addEventListener("touchstart", cb);
    }
  },
}
