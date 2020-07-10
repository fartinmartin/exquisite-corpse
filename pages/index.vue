<template>
  <div>
    <Alert />
    <ExquisiteCorpse />
  </div>
</template>

<script>
import Alert from "~/components/Alert";
import ExquisiteCorpse from "~/components/ExquisiteCorpse";
export default {
  name: "index",
  components: { ExquisiteCorpse, Alert }
};
</script>
