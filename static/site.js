document.addEventListener('alpine:init', () => {
  console.log("yo dawg")
  Alpine.store('lightMode', {
    on: this.$persist(false)
  })
})
