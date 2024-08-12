import { all } from "redux-saga/effects";
import sampleSaga from '@/middleware/features/sampleSaga';

export default function *rootSaga () {
    yield all([
        sampleSaga()
    ]);
}
