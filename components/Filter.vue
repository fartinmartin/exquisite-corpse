<template>
  <div class="border yellow info-panel mb mw-canvas filters">
    <form>
      <div>
        <input
          type="radio"
          id="corpses"
          name="collection"
          value="corpses"
          v-model="type"
          @click="handleTypeChoice"
        />
        <label for="corpses" data-tooltip="filter by">
          <h1 class="icon interactive">corpses</h1>
        </label>
      </div>
      <div>
        <input
          type="radio"
          id="tops"
          name="collection"
          value="top"
          v-model="type"
          @click="handleTypeChoice"
        />
        <label for="tops" data-tooltip="filter by">
          <h1 class="icon interactive">tops</h1>
        </label>
      </div>
      <div>
        <input
          type="radio"
          id="mids"
          name="collection"
          value="mid"
          v-model="type"
          @click="handleTypeChoice"
        />
        <label for="mids" data-tooltip="filter by">
          <h1 class="icon interactive">mids</h1>
        </label>
      </div>
      <div>
        <input
          type="radio"
          id="bots"
          name="collection"
          value="bot"
          v-model="type"
          @click="handleTypeChoice"
        />
        <label for="bots" data-tooltip="filter by">
          <h1 class="icon interactive">bots</h1>
        </label>
      </div>
    </form>
    <form>
      <div>
        <input
          type="radio"
          id="date"
          name="field"
          value="date"
          v-model="field"
          @click="handleSortBy"
        />
        <label for="date" data-tooltip="sort by">
          <h1 class="icon interactive">date</h1>
        </label>
      </div>
      <div>
        <input
          type="radio"
          id="likes"
          name="field"
          value="likes"
          v-model="field"
          @click="handleSortBy"
        />
        <label for="likes" data-tooltip="sort by">
          <h1 class="icon interactive">likes</h1>
        </label>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "Filter",
};
</script>

<style lang="scss" scoped>
.filters {
  padding: 1rem calc(1rem - 7px);
}

form {
  display: flex;

  .icon {
    width: auto;
    padding: 0 5px;
  }

  input {
    display: none;
  }

  > *:not(:last-child) {
    margin-right: 1rem;
  }
}

input:not(:checked) + label h1 {
  font-weight: normal;
  opacity: 0.5;
}
</style>
