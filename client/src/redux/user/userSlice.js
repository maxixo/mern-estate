import {createSlice} from '@reduxjs/toolkit'

        const initialState = {
            currentUser : null,
            error : null,
            loading:false,
            updateSuccess: false,
        }

        const userSlice = createSlice({
            name: "user",
            initialState,
            reducers: {
                signInStart:(state) => {
                    state.loading = true;
                    state.updateSuccess = false;
                },
                signInSuccess:(state, action) => {
                    state.currentUser = action.payload;
                    state.loading = false;
                    state.error = null;
                    state.updateSuccess = false;
                },
                signInFailure:(state, action) => {
                    state.error = action.payload;
                    state.loading = false;
                    state.updateSuccess = false;
                },

                updateUserStart:(state) => {
                    state.loading = true;
                    state.error = null;
                    state.updateSuccess = false;
                },
                updateUserSuccess:(state, action) => {
                    state.currentUser = action.payload;
                    state.loading = false;
                    state.error = null;
                    state.updateSuccess = true;
                },
                updateUserFailure:(state, action) => {
                    state.error = action.payload;
                    state.loading = false;
                    state.updateSuccess = false;
                }

            
            }
        });

        export const {
            signInStart,
            signInSuccess,
            signInFailure,
            updateUserStart,
            updateUserSuccess,
            updateUserFailure
        } = userSlice.actions;

        export default userSlice.reducer;
