import { convertQuantity, UNIT_DIMENSIONS } from "./units.js";

function runTests() {
  console.log("Running Unit Conversion Tests...");
  let passed = 0;
  let failed = 0;

  const assert = (name, condition) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  };

  // Weight conversions
  assert("g to kg (1500g -> 1.5kg)", convertQuantity(1500, "g", "kg") === 1.5);
  assert("kg to g (2.5kg -> 2500g)", convertQuantity(2.5, "kg", "g") === 2500);
  
  // Volume conversions
  assert("mL to L (750mL -> 0.75L)", convertQuantity(750, "mL", "L") === 0.75);
  assert("L to mL (1.25L -> 1250mL)", convertQuantity(1.25, "L", "mL") === 1250);

  // Identity conversions
  assert("Same unit (10g -> 10g)", convertQuantity(10, "g", "g") === 10);
  assert("Count unit (5 items -> 5 items)", convertQuantity(5, "item", "item") === 5);

  // Decimal precision retention
  assert(
    "High precision conversion (1.00000003kg -> 1000.00003g)", 
    convertQuantity(1.00000003, "kg", "g") === 1000.00003
  );

  // Prevent dimension crossing
  try {
    convertQuantity(10, "g", "L");
    assert("Weight to Volume mismatch protection", false);
  } catch (e) {
    assert("Weight to Volume mismatch protection", e.message === "Dimension mismatch");
  }

  try {
    convertQuantity(50, "mL", "item");
    assert("Volume to Count mismatch protection", false);
  } catch (e) {
    assert("Volume to Count mismatch protection", e.message === "Dimension mismatch");
  }

  try {
    convertQuantity(10, "box", "item");
    assert("Unsupported unit protection", false);
  } catch (e) {
    assert("Unsupported unit protection", e.message === "Unsupported unit");
  }

  try {
    convertQuantity("abc", "g", "kg");
    assert("Invalid quantity protection", false);
  } catch (e) {
    assert("Invalid quantity protection", e.message === "Quantity must be a valid number");
  }

  console.log(`\nTests Run Complete: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
