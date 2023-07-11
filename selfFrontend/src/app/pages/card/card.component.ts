import { Component, Inject, OnInit } from '@angular/core';
import { Form } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { loadStripe } from '@stripe/stripe-js';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from 'src/app/Services/users.service';
import { SettingService } from 'src/app/Services/setting.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  selectedCard: any;
  form: Form | any;
  stripe: any;
  FormDisplay = false;
  submitBtn: any;
  elements: any;
  options = {
    mode: 'setup',
    currency: 'usd',
    appearance: {},
  };
  paymentElement: any;

  constructor(
    public dialogRef: MatDialogRef<CardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(MAT_DIALOG_DATA) public url: any,
    private userService: UsersService,
    private toastr: ToastrService,
    private settingsService: SettingService
  ) {}

  cards: any;
  StripePublicKey: any;

  async loadStripe() {
    this.settingsService.initGetSettings().subscribe({
      next: async (data: any) => {
        try {
          this.stripe = await loadStripe(data[0]?.StripePublicKey);
        } catch (error) {
          console.log(error);
        }
      },
    });
  }

  // public key

  async ngOnInit() {
    this.getCards();
    this.loadStripe();
  }

  async addCardButton() {
    this.FormDisplay = true;

    this.form = document.getElementById('payment-form') as HTMLFormElement;
    this.submitBtn = document.getElementById('submit') as HTMLButtonElement;

    setTimeout(async () => {
      this.elements = this.stripe?.elements(this.options);

      this.paymentElement = this.elements.create('payment', {
        layout: {
          type: 'accordion',
          defaultCollapsed: false,
          radios: true,
          spacedAccordionItems: false,
        },
      });
      this.paymentElement.on('loaderror', (event: any) => {
        this.toastr.error(event.error.message);
        return;
      });
      this.paymentElement.mount('#payment-element');
      this.form = document.getElementById('payment-form');
      this.submitBtn = document.getElementById('submit');
    }, 1000);
  }

  async AddCards() {
    if (this.submitBtn.disabled) {
      return;
    }

    this.submitBtn.disabled = true;

    const { error: submitError } = await this.elements.submit();

    if (submitError) {
      this.handleError(submitError);
      return;
    }
    const res = await fetch(
      'http://localhost:3000/StripeInt/' + this.data._id,
      {
        method: 'POST',
      }
    );

    const { client_secret: clientSecret } = await res.json();

    let elements = this.elements;

    const { error } = await this.stripe.confirmSetup({
      elements,
      clientSecret,
      confirmParams: {
        return_url: 'http://localhost:4200/#/users',
      },
    });

    if (error) {
      this.handleError(error);
    } else {
    }
  }

  handleError = (error: { message: string }) => {
    const messageContainer = document.querySelector(
      '#error-message'
    ) as HTMLElement;

    messageContainer.textContent = error.message;
    this.submitBtn.disabled = false;
  };

  handleCardSelection(cardID: any, card: any) {
    console.log(cardID, card);

    this.selectedCard = card;
    console.log(this.selectedCard);

    console.log('Selected Card Number:', cardID);
  }

  getImageSource(name: any) {
    if (name == 'mastercard') {
      return 'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg';
    } else if (name == 'visa') {
      return 'http://localhost:3000/uploads/cards/visa.svg';
    } else if (name == 'Rupay') {
      return 'http://localhost:3000/uploads/cards/rupay.svg';
    } else if (name == 'delete') {
      return 'http://localhost:3000/uploads/cards/delete.svg';
    } else if (name == 'close') {
      return 'http://localhost:3000/uploads/cards/close.svg';
    }
    return null;
  }

  async getCards() {
    const res = await fetch(
      'http://localhost:3000/StripeInt/payments/' + this.data._id,
      {
        method: 'POST',
      }
    );
    let PaymentsData = await res.json();

    this.cards = PaymentsData;
  }

  async DeleteCards(id: any) {
    let confimed = confirm('Are You Want Remove Card');
    if (!confimed) return;
    let btn = document.getElementById('DeleteCard') as HTMLButtonElement;

    btn.disabled = true;

    this.userService.onDeleteCard(id).subscribe({
      next: (data) => {
        this.cards = this.cards.filter((card: any) => {
          return card.id != data.card;
        });

        this.toastr.success(data.massge);
      },
      error: (error) => {
        console.log(error);

        this.toastr.error(error);
      },
    });
  }

  async addDefaultCard(selectedCard: any) {
    let btn = document.getElementById('SetCard') as HTMLButtonElement;
    btn.disabled = true;
    this.userService.initDefaultCard(this.data._id, selectedCard).subscribe({
      next: (data) => {
        console.log(data);

        this.data.defaultPayment = data.defaultPayment;
        btn.disabled = false;
      },
    });
  }
}
