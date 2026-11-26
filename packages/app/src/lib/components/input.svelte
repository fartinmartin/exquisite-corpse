<script lang="ts">
  type Props = {
    id: string;
    name?: string;
    label?: string;
    note?: string;
    placeholder?: string;
    maxlength?: number;
    type?: "text" | "password";
    temp?: boolean;
    value?: string;
    onfocus?: () => void;
  };

  let {
    id,
    name,
    label,
    note,
    placeholder,
    maxlength,
    type = "text",
    temp = false,
    value = $bindable(""),
    onfocus,
  }: Props = $props();
</script>

<div class="input-wrap" class:temp>
  {#if label}
    <label for={id}>
      {label}
      {#if note}<span class="note">{note}</span>{/if}
    </label>
  {/if}
  <input {id} {name} {type} {placeholder} {maxlength} bind:value {onfocus} />
</div>

<style lang="scss">
  .input-wrap {
    display: flex;
    width: 100%;
  }

  label,
  input {
    position: relative;
    width: 100%;
    padding: 0.5rem 0;
    border-bottom: 1px dotted var(--orange);
  }

  label {
    @media screen and (max-width: 544px) {
      width: 25%;
      padding-right: 1rem;
    }
  }

  ::placeholder,
  .temp input {
    color: #7f7f7f;
    opacity: 1;
  }

  .note {
    width: 100%;
    display: block;

    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate3d(100%, 100%, 0);

    font-size: 10px;
    text-align: center;

    @media screen and (max-width: 544px) {
      transform: translate3d(calc(100% - 4rem), 100%, 0);
      width: 400%;
    }
  }
</style>
