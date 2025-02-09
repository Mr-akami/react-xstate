import { atom } from 'jotai';
import { tourMachine } from './machines/tourMachine';
import { createActor } from 'xstate';

export const componentATotalAtom = atom<number>(0);
export const componentBTotalAtom = atom<number>(0);

const tourActor = createActor(tourMachine);
tourActor.start();

export const tourServiceAtom = atom(tourActor.getSnapshot()); 