<script setup lang="ts">
import { randint } from '@/helpers/commons'
import type { Cols } from '@/types/commons'

withDefaults(defineProps<{ itemCount?: number; cols?: Cols }>(), {
  itemCount: 5,
  cols: () => ({ md: 4, lg: 2 }),
})
</script>

<template>
  <BSkeletonWrapper>
    <BCard>
      <template #header>
        <BSkeleton width="30%" height="26px" class="m-0" />
      </template>

      <template v-for="count in itemCount" :key="count">
        <BRow :class="{ 'd-block': cols === null }">
          <BCol v-bind="cols">
            <div style="height: 38px" class="d-flex align-items-center">
              <BSkeleton
                class="m-0"
                :width="randint(45, 100) + '%'"
                height="24px"
              />
            </div>
          </BCol>

          <BCol>
            <div
              v-if="count % 2 === 0"
              class="w100 d-flex justify-content-between"
            >
              <BSkeleton width="100%" height="38px" />

              <BSkeleton width="38px" height="38px" class="ms-2" />
            </div>

            <BSkeleton v-else width="100%" height="38px" />

            <BSkeleton :width="randint(15, 35) + '%'" height="19px" />
          </BCol>
        </BRow>

        <hr />
      </template>

      <template #footer>
        <div class="d-flex justify-content-end w-100">
          <BSkeleton width="100px" height="36px" />
        </div>
      </template>
    </BCard>
  </BSkeletonWrapper>
</template>
