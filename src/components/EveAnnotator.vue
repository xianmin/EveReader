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

    this.$bus.on('click-show-annotator', this.onClickShowAnnotator)
  },

  methods: {
    _onMouseUp(evt) {
      evt.preventDefault();
      const selection = window.getSelection();
      if (!selection.isCollapsed) {
        this.selectRange = selection.getRangeAt(0);
        const rect = this.selectRange.getBoundingClientRect();
        this.setAnnotatorPosition(rect, evt.clientX, evt.clientY);

        this.annotator.cfiRange = new epubCfi(this.selectRange, this.$parent.section.cfiBase).toString();

        // if select, show EveAnnotatorPopover.vue
        this.showAnnotator = true;
        this.showAnnotatorFromClick = false;

        // temporary store text to annotator
        this.annotator.text = selection.toString();
      }
    },

    _onMouseDown() {
      this.showAnnotator = false;
      window.getSelection().removeAllRanges();
    },

    // rect is getBoundingClientRect()
    // annotator width = 130, height =65
    // annotator position is fixed
    setAnnotatorPosition(rect, pointerX, pointerY) {
      let tempTop = rect.bottom + 5;
      let tempLeft = pointerX - 65; // 65 is half width of annotator

      // fix annotator left position
      if (tempLeft < 0) {
        tempLeft = pointerX; 
      }

      // fix annotator right position
      if ((tempLeft + 130) > window.innerWidth) {
        tempLeft = window.innerWidth - 140;
      }

      // fix annotator top position, there is multiple switch
      const pointHigherRect = () => rect.bottom - pointerY > pointerY - rect.top + 20;
      const topEnough = () => rect.top > 65;
      const bottomEnough = () => window.innerHeight - rect.bottom > 65;
      if (pointHigherRect()) {
        if (topEnough()) {
          tempTop = rect.top - 65;
        } else if (!bottomEnough()) {
          tempTop = pointerY + 5;
        }
      } else if (!bottomEnough()) {
        if (topEnough()) {
          tempTop = rect.top -65;
        } else {
          tempTop = pointerY - 65;
        }
      }

      this.annotator.position.top = tempTop;
      this.annotator.position.left = tempLeft;
    },

    onClickShowAnnotator(evt, annotation) {
      this.showAnnotatorFromClick = true;

      this.annotator.cfiRange = annotation.cfiRange;
      this.annotator.type = annotation.type;
      this.annotator.text = annotation.text;

      let cfi = new epubCfi(this.annotator.cfiRange);
      this.selectRange = cfi.toRange(this.$store.state.ebookRootNode);
      let rect = this.selectRange.getBoundingClientRect();
      this.setAnnotatorPosition(rect, evt.clientX, evt.clientY);

      this.showAnnotator = true;
    },

    doAnnotatorHighlight(color) {
      if (this.showAnnotatorFromClick) {
        this.doAnnotatorDelete(); // delete first, than change color;
      }

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
      this.showAnnotator = false;
      this.showAnnotatorFromClick = false;
      let cfiRange = this.annotator.cfiRange;
      let type = this.annotator.type;
      let hash = encodeURI(type + '-' + cfiRange);

      this.$store.dispatch('annotation/deleteAnnotation', hash);
    },
  }


}
</script>

<style>

</style>
