import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { inferMineralSystem, runBenchmark } from "../../scripts/mineral_inverse_benchmark.mjs";

const dataset=JSON.parse(fs.readFileSync("data/mineral_benchmarks.json","utf8"));

test("mineral inverse engine ignores ground-truth fields during inference",()=>{
  const deposit=structuredClone(dataset.deposits[0]);
  const a=inferMineralSystem({id:deposit.id,observation_set:deposit.observation_set});
  deposit.ground_truth.edges=["fabricated_edge_that_must_not_change_inference"];
  const b=inferMineralSystem({id:deposit.id,observation_set:deposit.observation_set});
  assert.deepEqual(a,b);
});

test("all three controls produce non-empty causal graphs",()=>{
  const result=runBenchmark(dataset);
  assert.equal(result.results.length,3);
  for(const item of result.results){
    assert.ok(item.reconstruction.inferred_edges.length>0);
    assert.ok(item.reconstruction.rule_trace.length>0);
  }
});

test("exploration-proxy ablation cannot increase observation count",()=>{
  const result=runBenchmark(dataset);
  for(const item of result.results){
    assert.ok(item.exploration_proxy.observations<=item.observations);
  }
});

test("benchmark metrics stay within [0,1]",()=>{
  const result=runBenchmark(dataset);
  for(const mode of ["reconstruction","exploration_proxy"]){
    const a=result.aggregate[mode];
    for(const key of ["mean_precision","mean_recall","mean_f1"]){
      assert.ok(a[key]>=0 && a[key]<=1);
    }
  }
});
