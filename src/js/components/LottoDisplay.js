import { $, $$ } from '../utils/dom.js';
import { store } from '../index.js';
import { PURCHASE_TYPE } from '../utils/constants.js';
import Component from '../core/Component.js';
import Input from './Input/Input.js';
import Button from './Button/Button.js';

export default class LottoDisplay extends Component {
  static lottoCountPerPage = 10;

  initRender() {
    this.$target.innerHTML = `
    <div class="d-flex">
      <label id="total-lotto-count" class="flex-auto my-0"></label>
      <div class="flex-auto d-flex justify-end pr-1">
        <label class="switch">
          ${new Input({
            type: 'checkbox',
            classes: ['lotto-numbers-toggle-button'],
          }).getTemplate()}
          <span class="text-base font-normal">번호보기</span>
        </label>
      </div>
    </div>
    <div id="lotto-display-area" class="d-flex flex-wrap">
    </div>
    <div class="d-flex justify-center mt-2 items-center">
      ${new Button({
        id: 'prev-page-btn',
        type: 'button',
        classes: ['btn', 'btn-cyan', 'mr-1'],
        disabled: true,
        text: '◁ 이전',
      }).getTemplate()}
      <span class="text-xs"><span id="page-number">1</span>번째 페이지</span>
      ${new Button({
        id: 'next-page-btn',
        type: 'button',
        classes: ['btn', 'btn-cyan', 'ml-1'],
        disabled: true,
        text: '다음 ▷',
      }).getTemplate()}
      </div>
    `;
  }

  setup() {
    store.subscribe(this.render.bind(this));
  }

  selectDOM() {
    this.$toggleButton = $('.lotto-numbers-toggle-button');
    this.$lottoCount = $('#total-lotto-count');
    this.$lottoDisplayArea = $('#lotto-display-area');
    this.$prevPageButton = $('#prev-page-btn');
    this.$pageNumber = $('#page-number');
    this.$nextPageButton = $('#next-page-btn');
  }

  bindEvent() {
    this.$toggleButton.addEventListener(
      'change',
      this.onToggleSwitch.bind(this),
    );
    this.$prevPageButton.addEventListener(
      'click',
      this.onMovePrevPage.bind(this),
    );
    this.$nextPageButton.addEventListener(
      'click',
      this.onMoveNextPage.bind(this),
    );
  }

  showOnlyLottoImages() {
    this.$lottoDisplayArea.classList.remove('flex-col');
    this.$lottoDisplayArea.classList.remove('items-start');
    $$('.lotto-numbers').forEach($lottoNumbers => {
      $lottoNumbers.classList.add('d-none');
    });
  }

  showAllOfLottoInfo() {
    this.$lottoDisplayArea.classList.add('flex-col');
    this.$lottoDisplayArea.classList.add('items-start');
    $$('.lotto-numbers').forEach($lottoNumbers => {
      $lottoNumbers.classList.remove('d-none');
    });
  }

  onToggleSwitch() {
    this.$toggleButton.checked
      ? this.showAllOfLottoInfo()
      : this.showOnlyLottoImages();
  }

  onMovePrevPage() {
    const pageIndex = Number(this.$pageNumber.textContent);
    if (pageIndex <= 1) return;
    this.$pageNumber.textContent = pageIndex - 1;
    this.updateLottoView(store.getStates().lottos);
  }

  onMoveNextPage() {
    const pageIndex = Number(this.$pageNumber.textContent);
    const lastPageIndex = Math.ceil(
      store.getStates().lottos.length / LottoDisplay.lottoCountPerPage,
    );
    if (pageIndex >= lastPageIndex) return;
    this.$pageNumber.textContent = pageIndex + 1;
    this.updateLottoView(store.getStates().lottos);
  }

  lottoCountText(lottoCount) {
    return `총 ${lottoCount}개를 구매하였습니다.`;
  }

  lottoTemplate(numbers) {
    return `<span data-test="lotto" class="mx-1 text-4xl d-flex items-center justify-center">
              <img class="ticket" src="https://thumbs.dreamstime.com/b/lottery-icon-realistic-objects-eps-illustration-78053199.jpg"/>      
              <span class="lotto-numbers ${
                this.$toggleButton.checked ? '' : 'd-none'
              } text-2xl ml-4">${numbers.join(', ')}</span>
            </span>`;
  }

  clearView() {
    this.$target.classList.add('d-none');
    this.$lottoDisplayArea.innerHTML = '';
    this.$toggleButton.checked = false;
    this.onToggleSwitch();
    this.$pageNumber.textContent = 1;
  }

  toggleActivationPageMoveButton(pageIndex) {
    const lastPageIndex = Math.ceil(
      store.getStates().lottos.length / LottoDisplay.lottoCountPerPage,
    );

    this.$prevPageButton.disabled = pageIndex <= 1;
    this.$nextPageButton.disabled = pageIndex >= lastPageIndex;
  }

  updateLottoView(lottos) {
    const pageIndex = Number(this.$pageNumber.textContent);
    this.$target.classList.remove('d-none');
    this.$lottoCount.innerHTML = this.lottoCountText(lottos.length);
    this.$lottoDisplayArea.innerHTML = lottos
      .slice(
        (pageIndex - 1) * LottoDisplay.lottoCountPerPage,
        (pageIndex - 1) * LottoDisplay.lottoCountPerPage +
          LottoDisplay.lottoCountPerPage,
      )
      .map(lottoNumbers => this.lottoTemplate(lottoNumbers))
      .join('');
    this.toggleActivationPageMoveButton(pageIndex);
  }

  render(prevStates, states) {
    if (states.lottos.length === 0) {
      this.clearView();
      return;
    }
    if (
      states.purchaseType === PURCHASE_TYPE.AUTO &&
      prevStates.lottos !== states.lottos
    ) {
      this.updateLottoView(states.lottos);
    }
  }
}