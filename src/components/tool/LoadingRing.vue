<template>
  <svg :height="radius * 2" :width="radius * 2">
    <circle
      stroke="#409eff"
      fill="transparent"
      :stroke-dasharray="circumference + ' ' + circumference"
      :style="{ strokeDashoffset }"
      :stroke-width="stroke"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />
  </svg>
</template>

<script>
export default {
  props: ["radius", "progress", "stroke"],

  data() {
    const normalizedRadius = this.radius - this.stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    return {
      normalizedRadius,
      circumference,
    };
  },
  computed: {
    strokeDashoffset() {
      return this.circumference - (this.progress / 100) * this.circumference;
    },
  },
};
</script>

<style></style>
