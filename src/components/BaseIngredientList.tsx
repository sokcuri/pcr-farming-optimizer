import styled from 'astroturf';
import { useObserver } from 'mobx-react-lite';
import React from 'react';

import { useStateContext } from '../state';

import EquipIcon from './EquipIcon';
import { useResource } from './Wrapper';

const Title = styled('h2')<{ open?: boolean }>`
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: bold;
`;

const Description = styled('p')`
  margin-bottom: 24px;
`;

const EquipGrid = styled('ul')`
  display: grid;
  max-width: 48px * 10;
  margin: 0 auto;
  justify-content: center;
  grid-template-columns: repeat(auto-fill, 48px);
  grid-auto-rows: 48px;
  grid-gap: 0;
  gap: 0;
`;

const EquipCount = styled('span')`
  text-shadow: 1px 1px white, -1px 1px white, 1px -1px white, -1px -1px white;
`;

export default function BaseIngredientList() {
  const unitData = useResource('unit').get();
  const equipmentData = useResource('equipment').get();
  const rootState = useStateContext();
  const baseIngredients = useObserver(
    () => rootState.allBaseIngredientsWithResource(unitData, equipmentData),
  );
  if (baseIngredients.size === 0) {
    return (
      <section>
        <Title>Ingredients</Title>
        <div>No items to collect</div>
      </section>
    );
  }
  const icons = [...baseIngredients.entries()]
    .sort(([idA, countA], [idB, countB]) => {
      if (countA !== countB) {
        return countA - countB;
      }
      const eqA = equipmentData.get(idA);
      const eqB = equipmentData.get(idB);
      if (eqA === eqB) {
        return 0;
      }
      if (eqA == null) {
        return 1;
      }
      if (eqB == null) {
        return -1;
      }
      if (eqA.promotion_level === eqB.promotion_level) {
        return idA < idB ? -1 : idA === idB ? 0 : 1;
      }
      const promoMap = {
        blue: 1,
        bronze: 2,
        silver: 3,
        gold: 4,
        purple: 5,
        special: 99,
      };
      const promoIdxA = promoMap[eqA.promotion_level];
      const promoIdxB = promoMap[eqB.promotion_level];
      return promoIdxA - promoIdxB;
    })
    .map(([id, count]) => (
      <li key={id}>
        <InteractiveEquipIcon id={id} count={count} />
      </li>
    ));

  return (
    <section>
      <Title>Ingredients</Title>
      <Description>
        Click the equipment icon to toggle.
      </Description>
      <EquipGrid>
        {icons}
      </EquipGrid>
    </section>
  );
}

function InteractiveEquipIcon(props: { id: string; count: number }) {
  const { id, count } = props;
  const equipmentData = useResource('equipment').get();
  const rootState = useStateContext();
  const active = useObserver(() => !rootState.excludedEquips.has(id));
  const handleChange = React.useCallback(value => {
    if (value) {
      rootState.includeEquip(id);
    } else {
      rootState.excludeEquip(id);
    }
  }, [id]);
  return (
    <EquipIcon
      id={id}
      name={equipmentData.get(id)?.name || ''}
      size="xsmall"
      active={active}
      dimInactive
      onChange={handleChange}
    >
      <EquipCount>{count}</EquipCount>
    </EquipIcon>
  );
}
