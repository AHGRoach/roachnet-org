function sharpStub() {
  throw new Error('The RoachNet text-only runtime does not include sharp image processing.')
}

sharpStub.cache = () => {}
sharpStub.concurrency = () => 1
sharpStub.simd = () => false
sharpStub.format = {}

module.exports = sharpStub
module.exports.default = sharpStub
