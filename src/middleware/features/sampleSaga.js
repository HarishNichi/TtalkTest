import { put, takeEvery } from 'redux-saga/effects';
import { increment } from "@/redux/features/counterSlice"
import { EXAMPLE_SAGA_INCREMENT } from '@/utils/constant';

// Worker saga will be fired on SAMPLE_PAGE_SAGA actions
function *sampleUpdateFunction (action) {
    try {
        yield put(increment({ payload: 10 }));
    } catch (e) {
        // "Something went wrong !!"
    }
}

// Starts fetchUser on each dispatched EXAMPLE_SAGA_INCREMENT action
// Allows concurrent fetches
function *sampleSaga () {
    yield takeEvery(EXAMPLE_SAGA_INCREMENT, sampleUpdateFunction);
}

export default sampleSaga;
