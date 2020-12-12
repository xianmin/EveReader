<template>
  <eve-annotator-popover
    v-show = 'showAnnotator'
    :showAnnotatorFromClick = 'showAnnotatorFromClick'
    :annotatorPosition = "annotator.position"
    @do-annotator-highlight = 'doAnnotatorHighlight'
    @do-annotator-delete = 'doAnnotatorDelete'
  />
</template>

<script>
import EveAnnotatorPopover from './EveAnnotatorPopover.vue';
import epubCfi from '../epubjs/epubcfi';
import highlighter from './highlighter';

export default {
  components: { EveAnnotatorPopover },

  data() {
    return {
      viewSectionElement: null,
      showAnnotator: false,
      showAnnotatorFromClick: false,
      annotator: {
        position: {
          top: 0, 
          left: 0,
        },
        cfiRange: '',
        text: '',
      },
      selectRange: null,
    }
  },

  mounted() {
    // this.highlighter = new Highlighter();
    this.viewSectionElement = this.$parent.$refs.viewSection;
    this.viewSectionElement.addEventListener('mouseup', this._onMouseUp.bind(this));
    this.viewSectionElement.addEventListener('mousedown', this._onMouseDown.bind(this));
  },

  methods: {
    _onMouseUp(e) {
      e.preventDefault();

      const selection = window.getSelection();
      this.selectRange = selection.getRangeAt(0);
      const rect = this.selectRange.getBoundingClientRect();
      this.setAnnotatorPosition(rect);

      this.annotator.cfiRange = new epubCfi(this.selectRange, this.$parent.section.cfiBase).toString();

      // if select, show EveAnnotatorPopover.vue
      this.showAnnotator = !selection.isCollapsed;
      this.showAnnotatorFromClick = false;

      // temporary store text to annotator
      this.annotator.text = selection.toString();
    },

    _onMouseDown() {
      this.showAnnotator = false;
      window.getSelection().removeAllRanges();
    },

    // rect is getBoundingClientRect()
    // annotator position at bottom and center of selection
    // position relative to the parent container eve-reader-container
    // annotator width = 130, height =65
    setAnnotatorPosition(rect, offsetTop = 0, offsetLeft = 0) {
      let tempTop = rect.bottom + window.scrollY + 5 - offsetTop;
      let tempLeft = rect.left + rect.width / 2 - 65 - offsetLeft; // 65 is half width of annotator
      let iframe = document.getElementById('eve-reader-view');

      // fix annotator left position
      if (tempLeft < 0) {
        tempLeft = 10; 
      }

      // fix annotator right position
      if ((iframe.clientWidth + offsetLeft) - (tempLeft + 130) < 0) {
        tempLeft = iframe.clientWidth + offsetLeft - 140;
      }

      // fix annotator top position
      let screenBottom = window.scrollY + window.innerHeight;
      let selectionBottom = rect.bottom - offsetTop;
      if (screenBottom - selectionBottom < 70 || (tempTop + 70) > iframe.clientHeight ) {
        tempTop = rect.top + window.scrollY - offsetTop - 70;
      }

      this.annotator.position.top = tempTop;
      this.annotator.position.left = tempLeft;
    },

    onClickShowAnnotator(e) {
      this.showAnnotatorFromClick = true;

      let rect = e.target.getBoundingClientRect();
      // because rect is relative to the parent window, we need offset iframe
      let iframeElement = document.getElementById('eve-reader-view');
      let iframeRect = iframeElement.getBoundingClientRect();
      this.setAnnotatorPosition(rect, iframeRect.top, iframeRect.left);

      // this.annotator.cfiRange = e.target.getAttribute('data-epubcfi');
      // this.annotator.type = e.target.getAttribute('data-type');
      // let hash = encodeURI(this.annotator.type + '-' + this.annotator.cfiRange);
      // this.annotator.text = this.ebook.allAnnotation.find(e => e.hash === hash).text;

      this.showAnnotator = true;
    },

    doAnnotatorHighlight(color) {
      let style = 'background:' + color + ';';
      highlighter.highlight(this.selectRange, style);

      let annotation = {};
      annotation.type = 'highlight';
      annotation.cfiRange = this.annotator.cfiRange;
      annotation.color = color;
      annotation.hash = encodeURI('highlight-' + annotation.cfiRange);
      annotation.text = this.annotator.text;
      annotation.sectionIndex = this.$parent.section.index;
      annotation.date = new Date().toISOString();

      this.showAnnotator = false;
      this.$store.dispatch('annotation/addAnnotation', annotation);
    },

    doAnnotatorDelete() {
      let cfiRange = this.annotator.cfiRange;
      let type = this.annotator.type;
      this.rendition.annotations.remove(cfiRange, type);
      this.showAnnotator = false;

      let hash = encodeURI(type + '-' + cfiRange);
      this.ebook.deleteAnnotationFromDB(hash);
    },
  }


}
</script>

<style>

</style>
