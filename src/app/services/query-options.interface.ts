import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export interface QueryOptions {
  where?: { field: string; operator: firebase.firestore.WhereFilterOp; value: any }[];
  orderBy?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
}