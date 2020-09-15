<template>
  <div class="radio-wrap" :class="{ active: active === value }">
    <input
      type="radio"
      :id="value"
      :name="group"
      :value="value"
      @click="$emit('selected', value)"
    />
    <label :for="value">
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  model: {
    prop: "active",
    event: "selected"
  },
  props: {
    value: { type: String, required: true },
    active: { required: true },
    group: String,
    tooltip: String
  }
};
</script>

<style lang="scss" scoped>
input {
  display: none;
}

.radio-wrap:not(.active) {
  filter: grayscale(1);
  opacity: 0.6;
}
</style>
