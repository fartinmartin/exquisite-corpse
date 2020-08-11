<template>
  <Panel color="blue" interactive no-padding>
    <img :src="drawing.thumb" />
  </Panel>
</template>

<script>
export default {
  name: "Drawing",

  props: { drawing: Object },
};
</script>
