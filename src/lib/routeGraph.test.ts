import { describe, expect, it } from 'vitest';
import { SKI_NETWORKS, type SkiNetwork } from '@/data/skiArea';
import {
  appendRouteOption,
  getLiftsFrom,
  getNextPisteOptions,
  getPisteRunsFrom,
  getStartRun,
  toPisteStep,
  type RouteStep,
} from '@/lib/routeCalculator';

const network = SKI_NETWORKS.folgaria as SkiNetwork;

function findPiste(id: string) {
  const piste = network.pistes.find((item) => item.id === id);
  if (!piste) throw new Error(`Hiányzó pálya a teszthez: ${id}`);
  return piste;
}

function startWith(id: string): RouteStep[] {
  const piste = findPiste(id);
  const run = getStartRun(network, piste);
  if (!run) throw new Error(`Nem indulható pálya: ${id}`);
  return [toPisteStep(piste, run.fromNodeId, run.toNodeId)];
}

function optionsAfter(steps: RouteStep[]) {
  return getNextPisteOptions(network, steps);
}

function choose(steps: RouteStep[], id: string): RouteStep[] {
  const option = optionsAfter(steps).find((item) => item.piste.id === id);
  if (!option) throw new Error(`A ${id} pálya nem választható ebben a helyzetben`);
  return appendRouteOption(steps, option);
}

const pisteIdsOf = (steps: RouteStep[]) => steps.flatMap((step) => (step.kind === 'piste' ? [step.id] : []));

describe('Folgaria pályaadatbázis', () => {
  it('pontosan 44 egyedi pályát tartalmaz', () => {
    const ids = network.pistes.map((piste) => piste.id);
    expect(ids).toHaveLength(44);
    expect(new Set(ids).size).toBe(44);
  });

  it('nem tartalmaz kitalált a/b/c/d-osztott pályát', () => {
    const invented = ['1a', '1d', '12a', '12b', '19a', '19b', '21a', '21b', '23a', '23e', '28a', '28b'];
    invented.forEach((id) => expect(network.pistes.some((piste) => piste.id === id)).toBe(false));
  });

  it('a 6-os és a 9-es közös szakasza a 3-as felvonó tetejétől a felezőpontig tart', () => {
    const shared = network.segments.filter((segment) => segment.pisteIds.includes('6') && segment.pisteIds.includes('9'));
    expect(shared.map((segment) => segment.id).sort()).toEqual(['3_end>j_francolini_5b', 'j_francolini_5b>j_6_9_mid']);
    shared.forEach((segment) => expect(segment.pisteIds).toEqual(['6', '9']));
  });

  it('a 6-os és a 9-es pálya neve, száma és színe változatlan', () => {
    expect(findPiste('6')).toMatchObject({ name: 'Francolini (pista di solo rientro)', difficulty: 'red' });
    expect(findPiste('9')).toMatchObject({ name: 'Panoramica', difficulty: 'blue' });
  });

  it('a felezőponti csomópontnál a 6-os és a 9 alsó szakasz válik szét', () => {
    const node = network.nodes.find((item) => item.id === 'j_6_9_mid');
    expect(node?.pisteIds.sort()).toEqual(['6', '9', '9a']);
    const runs = getPisteRunsFrom(network, 'j_6_9_mid').map((run) => `${run.piste.id}:${run.toNodeId}`).sort();
    expect(runs).toEqual(['6:4_start', '9a:5_start']);
  });

  it('a csomópontok nem jelennek meg sípályaként', () => {
    const pisteIds = new Set(network.pistes.map((piste) => piste.id));
    network.nodes.forEach((node) => expect(pisteIds.has(node.id)).toBe(false));
  });

  it('a 29-es és 28-as pálya kereszteződése nem átjáró', () => {
    expect(findPiste('29').nodeIds.includes('j_coston_mid')).toBe(false);
    expect(findPiste('28').nodeIds.includes('22_end')).toBe(false);
  });
});

describe('útvonaltervezés a Folgaria gráfon', () => {
  it('a 6-os pályáról a felezőpontnál át lehet menni a 9 alsó szakaszra', () => {
    const steps = choose(startWith('6'), '6');
    expect(pisteIdsOf(steps)).toEqual(['6']);
    const toLower = optionsAfter(steps).find((option) => option.piste.id === '9a');
    expect(toLower).toMatchObject({ fromNodeId: 'j_6_9_mid', toNodeId: '5_start' });
  });

  it('a 9-es pályáról a közös szakasz elején át lehet menni a 6-osra', () => {
    const steps = startWith('9');
    const toSix = optionsAfter(steps).find((option) => option.piste.id === '6');
    expect(toSix).toMatchObject({ fromNodeId: '3_end', toNodeId: 'j_francolini_5b' });
  });

  it('a 9-esről a felső csomópontnál át lehet térni az 5-ösre', () => {
    expect(optionsAfter(startWith('9')).find((option) => option.piste.id === '5')).toMatchObject({
      fromNodeId: '3_end',
      toNodeId: 'j_carpet_5',
    });
  });

  it('a közös szakasz 5b elágazásánál a 9-esről át lehet térni az 5b-re', () => {
    const atBranch = choose(startWith('9'), '9');
    expect(atBranch[atBranch.length - 1]).toMatchObject({ id: '9', to: 'j_francolini_5b' });
    expect(optionsAfter(atBranch).find((option) => option.piste.id === '5b')).toMatchObject({
      fromNodeId: 'j_francolini_5b',
      toNodeId: 'j_carpet_5',
    });
  });

  it('a 6-os pályáról az első ötödnél át lehet térni az 5b-re', () => {
    const steps = startWith('6');
    expect(steps[steps.length - 1]).toMatchObject({ id: '6', to: 'j_francolini_5b' });
    expect(optionsAfter(steps).find((option) => option.piste.id === '5b')).toMatchObject({
      fromNodeId: 'j_francolini_5b',
      toNodeId: 'j_carpet_5',
    });
  });

  it('az 5b-ről a varázsszőnyeggel lehet az 1b irányába menni, az 5-ösre nem', () => {
    const offered = optionsAfter(startWith('5b'));
    expect(offered.map((option) => option.piste.id)).not.toContain('5');
    expect(offered.find((option) => option.piste.id === '1b')).toMatchObject({ fromNodeId: '1_end' });
    expect(getLiftsFrom(network, 'j_carpet_5').map((lift) => lift.id)).toEqual(['lift_carpet_5']);
    expect(offered.map((option) => option.piste.id)).not.toContain('1c');
    expect(offered.map((option) => option.piste.id)).not.toContain('1');
  });

  it('a 12-es Serrada pályáról le lehet térni a 13-as Slalom Tollra', () => {
    const steps = startWith('12');
    expect(steps[0]).toMatchObject({ id: '12', to: 'j_serrada_half' });
    const toThirteen = optionsAfter(steps).find((option) => option.piste.id === '13');
    expect(toThirteen).toMatchObject({ fromNodeId: 'j_serrada_half', toNodeId: '8_start' });
  });

  it('a 12 és 13 továbbra is két külön választható pálya', () => {
    const offered = optionsAfter(startWith('12')).map((option) => option.piste.id);
    expect(offered).toContain('13');
    expect(offered.filter((id) => id === '12')).toHaveLength(1);
  });

  it('egy sípálya egy útvonalban csak egyszer szerepel', () => {
    const steps = choose(choose(startWith('1b'), '1'), '1');
    expect(pisteIdsOf(steps).filter((id) => id === '1')).toHaveLength(1);
    const offered = optionsAfter(steps).map((option) => option.piste.id);
    expect(offered).not.toContain('1');
    expect(offered).not.toContain('1b');
  });

  it('a felvonók automatikusan bekerülnek a útvonalba', () => {
    const steps = choose(choose(choose(startWith('1'), '1'), '1'), '1c');
    expect(steps.map((step) => step.kind)).toEqual(['piste', 'lift', 'piste']);
    expect(steps[1]).toMatchObject({ id: 'lift_1', from: '1_start', to: '1_end' });
  });

  it('1b a 1-es pályába csatlakozik, a 1-es innen folytatódik', () => {
    const steps = choose(startWith('1b'), '1');
    expect(steps[steps.length - 1]).toMatchObject({ id: '1', from: 'j_maso_half', to: 'j_1b_join' });
  });

  it('a 23 után a 23b, majd a 23b után a 19-es pálya érhető el', () => {
    const steps = choose(choose(startWith('23'), '23b'), '19');
    expect(pisteIdsOf(steps)).toEqual(['23', '23b', '19']);
  });

  it('a 24-es pálya a 16-os felvonó alsó állomásához vezet', () => {
    const steps = choose(startWith('24'), '24');
    expect(steps[steps.length - 1]).toMatchObject({ id: '24', to: '16_start' });
    expect(getLiftsFrom(network, '16_start').map((lift) => lift.id)).toEqual(['lift_16']);
  });

  it('a 24-es pálya a közös csomópontnál a 23-as pályára is átvált', () => {
    const offered = optionsAfter(startWith('24')).map((option) => option.piste.id);
    expect(offered).toContain('23');
  });

  it('a 26-os, 25b és 26b pályák a közös szakaszon kínálkoznak', () => {
    const offered = optionsAfter(startWith('26')).map((option) => option.piste.id).sort();
    expect(offered).toEqual(['25b', '26b']);
  });

  it('a 28 után a 31-es, majd a 30-as pálya érhető el', () => {
    const steps = choose(choose(startWith('28'), '31'), '30');
    expect(pisteIdsOf(steps)).toEqual(['28', '31', '30']);
  });

  it('a 2-es és 3-as pálya külön választási lehetőség', () => {
    const offered = getPisteRunsFrom(network, '2_end').map((run) => run.piste.id).sort();
    expect(offered).toEqual(['2', '3']);
  });

  it('a 10 és 10b, valamint a 27 és 27b külön választható párok', () => {
    expect(getPisteRunsFrom(network, '7_end').map((run) => run.piste.id)).toEqual(expect.arrayContaining(['10', '10b']));
    expect(getPisteRunsFrom(network, '19_end').map((run) => run.piste.id)).toEqual(expect.arrayContaining(['27', '27b']));
  });

  it('a 9b pálya a Rainer elágazásnál a 21-esre vezet', () => {
    const steps = choose(startWith('9b'), '21');
    expect(steps[steps.length - 1]).toMatchObject({ id: '21', from: 'j_rainer_mid' });
  });

  it('a 22-es fekete Rainer-variáns a 21-es felénél indul és a 21-es utolsó hatodánál tér vissza', () => {
    expect(findPiste('22').difficulty).toBe('black');
    const fromMid = optionsAfter(startWith('21')).find((option) => option.piste.id === '22');
    expect(fromMid).toMatchObject({ fromNodeId: 'j_rainer_mid', toNodeId: 'j_21_22_join' });
    expect(getPisteRunsFrom(network, 'j_21_22_join').map((run) => `${run.piste.id}:${run.toNodeId}`)).toEqual(['21:14_start']);
  });

  it('a 23c Leite a 15-ös felvonó két végét köti össze', () => {
    expect(getPisteRunsFrom(network, '15_end').map((run) => run.piste.id)).toContain('23c');
    expect(findPiste('23c')).toMatchObject({ difficulty: 'red', nodeIds: ['15_end', '15_start'] });
  });

  it('a Baby Coe szőnyeg alja a 23-as felénél csatlakozik, onnan a 24-esen a 16-os alja érhető el', () => {
    expect(getLiftsFrom(network, 'j_carpet_23d').map((lift) => lift.id)).toEqual(['lift_carpet_baby_coe']);
    expect(getPisteRunsFrom(network, 'j_babycoe_top')).toMatchObject([{ piste: { id: '23d' }, toNodeId: 'j_carpet_23d' }]);
    const steps = choose(choose(startWith('23d'), '23'), '24');
    expect(steps[steps.length - 1]).toMatchObject({ id: '24', to: '16_start' });
  });

  it('a 14a és 14b összekötő pályák a felvonók alsó állomásait kötik össze', () => {
    const steps = choose(startWith('14a'), '14b');
    expect(steps[steps.length - 1]).toMatchObject({ from: '9_start', to: '6_start' });
  });
});
