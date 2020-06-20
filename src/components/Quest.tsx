import styled from 'astroturf';
import { useObserver } from 'mobx-react-lite';
import React from 'react';

import { calculateDrops } from '../resources/quests';
import { useStateContext } from '../state';

import EquipIcon from './EquipIcon';
import Icon from './Icon';
import { useResource } from './Wrapper';

const AreaId = styled('div')`
  display: flex;
  height: 32px;
  align-items: center;

  > img:last-of-type {
    margin-right: 8px;
  }
`;

const Drops = styled('dl')`
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;

  > * {
    margin-right: 4px;
    &:last-of-type {
      margin-right: 0;
    }
  }
`;

const DropGroup = styled('div')`
  flex: none;

  > dt {
  }

  > dd {
    display: flex;
  }
`;

interface Props {
  id: string;
  score?: number;
}

const difficulties = [, 'N', 'H', 'VH'];

export default function Quest(props: Props) {
  const { id } = props;
  const unitData = useResource('unit').get();
  const equipmentData = useResource('equipment').get();
  const { idQuestMap } = useResource('quest').get();
  const quest = idQuestMap.get(id);
  if (quest == null) {
    return null;
  }
  const difficultyId = difficulties[Number(id[1])];
  const areaId = parseInt(id.substring(2, 5), 10);
  const stageId = parseInt(id.substring(6, 9), 10);

  const drops = calculateDrops(quest).flat();
  const memoryPieces = [];
  const dropGroups = new Map<number, string[]>();
  for (const drop of drops) {
    if (drop.reward.type === 'item' && drop.reward.id[0] === '3') {
      memoryPieces.push(drop.reward.id);
    }
    if (drop.reward.type === 'equipment') {
      const group = dropGroups.get(drop.odds) ?? [];
      group.push(drop.reward.id);
      dropGroups.set(drop.odds, group);
    }
  }

  const rootState = useStateContext();
  const equipmentIdMap = useObserver(
    () => rootState.allBaseIngredientsExcludedWithResource(unitData, equipmentData)
  );

  const sortedGroups = [...dropGroups.entries()];
  sortedGroups.sort(([a], [b]) => b - a);
  return (
    <li>
      <AreaId>
        {memoryPieces.map(id => (
          <Icon
            key={id}
            size="xxsmall"
            src={new URL(`/icons/item/${id}.png`, 'https://ames-static.tirr.dev').toString()}
            alt=""
          />
        ))}
        {`${areaId}-${stageId}${difficultyId}`}
        {props.score != null && ` (scored ${props.score})`}
      </AreaId>
      <Drops>
        {sortedGroups.map(([odds, ids]) => (
          <DropGroup key={odds}>
            <dt>{odds}%</dt>
            <dd>
              {ids.map(id => (
                <EquipIcon
                  key={id}
                  size="xsmall"
                  id={id}
                  name=""
                  dimInactive
                  active={equipmentIdMap.has(id)}
                />
              ))}
            </dd>
          </DropGroup>
        ))}
      </Drops>
    </li>
  );
}
