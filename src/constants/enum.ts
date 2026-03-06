export enum ROOM_STATUS {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    REPAIRING = 'REPAIRING'
}

export const MAX_PEOPLE = [2, 4] as const
export type MaxPeople = typeof MAX_PEOPLE[number]