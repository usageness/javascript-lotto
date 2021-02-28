import {
  ACTION_TYPE,
  ALERT_MESSAGE,
  CLASSNAME,
} from "../../constants/index.js";
import { EmptyInputError, ValidationError } from "../../errors/index.js";
import { Lotto } from "../../models/index.js";
import store from "../../store/index.js";
import { $, $$, toClassSelector as toCS } from "../../utils/index.js";
import Presentational from "./Presentational.js";

const createContainer = () => {
  const $$inputs = $$(toCS(CLASSNAME.WINNING_NUMBER.INPUT));
  const $bonusInput = $(toCS(CLASSNAME.WINNING_NUMBER.BONUS_INPUT));

  const toNumbers = ($$inputs, $bonusInput) => {
    const inputs = [...$$inputs];

    if (inputs.some(($input) => $input.isEmpty()) || $bonusInput.isEmpty()) {
      throw new EmptyInputError(
        ALERT_MESSAGE.ERROR.WINNING_NUMBERS_INPUT.EMPTY
      );
    }

    const numbers = inputs
      .map(($input) => Number($input.value))
      .sort((a, b) => a - b);
    const bonusNumber = Number($bonusInput.value);

    return [numbers, bonusNumber];
  };

  const validate = (numbers, bonusNumber) => {
    const numbersSet = new Set([...numbers, bonusNumber]);

    if (numbersSet.size < numbers.length + 1) {
      throw new ValidationError(
        ALERT_MESSAGE.ERROR.WINNING_NUMBERS_INPUT.DUPLICATED
      );
    }

    if (
      [...numbersSet].some((number) => {
        return (
          !Number.isInteger(number) ||
          number < Lotto.MIN_NUMBER ||
          number > Lotto.MAX_NUMBER
        );
      })
    ) {
      throw new ValidationError(
        ALERT_MESSAGE.ERROR.WINNING_NUMBERS_INPUT.OUT_OF_RANGE
      );
    }
  };

  const getWinningNumberWithValidation = (event) => {
    event.preventDefault();

    try {
      const [numbers, bonusNumber] = toNumbers($$inputs, $bonusInput);

      validate(numbers, bonusNumber);

      store.dispatch({
        type: ACTION_TYPE.WINNING_NUMBERS.SET,
        payload: {
          numbers,
          bonusNumber,
        },
      });
    } catch (error) {
      if (
        error instanceof EmptyInputError ||
        error instanceof ValidationError
      ) {
        alert(error.message);
        return;
      }

      throw error;
    }
  };

  const select = (state) => state.lottos;

  let currentLottos = select(store.getState());

  const render = () => {
    let previousLottos = currentLottos;
    currentLottos = select(store.getState());

    const hasChanged = previousLottos !== currentLottos;
    if (!hasChanged) return;

    Presentational.render({
      isLottoInitialAdded: previousLottos.length === 0,
      isLottoCleared: currentLottos.length === 0,
    });
  };

  const init = () => {
    Presentational.init(getWinningNumberWithValidation);

    store.subscribe(render);
  };

  return { init };
};

const WinningNumberContainer = createContainer();

export default WinningNumberContainer;