import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState,} from '@ngrx/signals';
import {TipgroupEntryResponseDto,} from '@tippapp/shared/data-access';
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, pipe, switchMap, tap} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {TipgroupService} from "../tipgroup.service";
import {ErrorManagementService} from "../../error-management/error-management.service";

type TipgroupState = {
  isLoading: boolean;
  availableTipgroups: TipgroupEntryResponseDto[] | null;
  error: boolean;
};

const initialState: TipgroupState = {
  isLoading: false,
  availableTipgroups: null,
  error: true,
};

export const TipgroupStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withComputed((store) => ({
    hasTipgroups: computed(() => (store.availableTipgroups() && store.availableTipgroups()!.length > 0)),
    hasError: computed(() => !!store.error()),
  })),

  withMethods(
    (
      store,
      errorService = inject(ErrorManagementService)
    ) => ({
      loadAvailableGroupsSuccess: (availableGroups: TipgroupEntryResponseDto[]) => {
        patchState(store, {isLoading: false, availableTipgroups: availableGroups});
      },

      loadAvailableGroupsFailure: (error: HttpErrorResponse) => {
        errorService.handleApiError(error)
        patchState(store, {
          isLoading: false,
          error: true,
        });
      },
    })
  ),

  withMethods((store, tipgroupService = inject(TipgroupService)) => ({
    loadAvailableTipgroups: rxMethod<void>(
      pipe(
        tap(() => patchState(store, {isLoading: true, error: false})),
        switchMap(() => {
          return tipgroupService.getAvailableTipgroups().pipe(
            tap((response: TipgroupEntryResponseDto[]) => store.loadAvailableGroupsSuccess(response)),
            catchError((error) => {
              store.loadAvailableGroupsFailure(error);
              return EMPTY;
            })
          );
        })
      )
    )
  }))
);
