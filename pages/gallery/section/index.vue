<script>
export default {
  middleware: [
    function({ redirect }) {
      redirect("/gallery");
    }
  ]
};
</script>
