<script lang="ts">
  import Seo from "#lib/components/seo.svelte";
  import type { ActionData } from "./$types";
  import Button from "#lib/components/button.svelte";
  import Input from "#lib/components/input.svelte";
  import Panel from "#lib/components/panel.svelte";

  let { form }: { form: ActionData } = $props();
  let password = $state("");
</script>

<Seo title="admin" noindex />

<div class="wrap">
  <form method="POST">
    <Panel class="admin">
      <Input
        id="admin-password"
        type="password"
        placeholder={form?.error ?? "password"}
        bind:value={password}
        name="password"
      />
      <Button type="submit" text="log in" />
    </Panel>
  </form>
</div>

<style lang="scss">
  form {
    display: flex;
  }

  :global(.admin .content) {
    justify-content: stretch;
  }
</style>
