import { Component, OnInit, inject } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { orderBy, where } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);


  products: Product[] = [];
  loading: boolean = false;

  generatePDF(product: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();


  
    // Título
    const title = 'CHINO SA DE CV';
    doc.setFontSize(18);
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 22);
  
    // Subtítulo
    const subtitle = 'Subtítulo del Documento';
    doc.setFontSize(12);
    const subtitleWidth = doc.getTextWidth(subtitle);
    const subtitleX = (pageWidth - subtitleWidth) / 2;
    doc.text(subtitle, subtitleX, 32);
 
  
    // Definir las columnas de la tabla
    const columns = [
      { header: 'Nombre', dataKey: 'name' },
      { header: 'Precio', dataKey: 'price' },
      { header: 'Unidades Vendidas', dataKey: 'soldUnits' },
      { header: 'Ganancia', dataKey: 'gain' }
    ];
  
    // Definir los datos de la tabla
    const data = [
      {
    
          name: product.name,
        price: product.price,
        soldUnits: product.soldUnits,
        gain: (product.price * product.soldUnits).toFixed(2)
      }
    ];


  // Agregar la tabla al PDF
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => item[col.dataKey])),
    startY: 40 // Ajustar la posición vertical inicial de la tabla
  });
    
    // Crear contenido del PDF solo para el producto seleccionado
    // const pdfContent = `Nombre: ${product.name}\nPrecio: ${product.price}\nUnidades Vendidas: ${product.soldUnits}\nGanancia: ${product.price * product.soldUnits}`;

    // doc.text(pdfContent, 10, 10);
    doc.save(`${product.name}.pdf`); // Guardar el PDF con el nombre del producto
  }

  ngOnInit() {
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }
  
  ionViewWillEnter() {
    this.getProducts();
  }


  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  // ====== Obtener ganancias =====
  getProfits() {
    return this.products.reduce((index, product) => index + product.price * product.soldUnits, 0);
  }

  // ====== Obtener productos =====
  getProducts() {
    let path = `users/${this.user().uid}/products`;

    this.loading = true;

    let query = [
      orderBy('soldUnits', 'desc'),
      // where('soldUnits', '>', 30)   
    ]



    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        console.log(res);
        this.products = res;

        this.loading = false;
        sub.unsubscribe();
      }
    })
  }

  // ====== Agregar o actualizar producto =====
  async addUpdateProduct(product?: Product) {

    console.log("AddUpdateProduct")
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    })

    if (success) this.getProducts();
  }

  // ====== Confirmar eliminación del producto =====
  async confirmDeleteProduct(product: Product) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar Producto',
      message: '¿Quieres eliminar este producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, eliminar',
          handler: () => {
            this.deleteProduct(product)
          }
        }
      ]
    });

  }


  // ======== Eliminar Producto =======
  async deleteProduct(product: Product) {

    let path = `users/${this.user().uid}/products/${product.id}`

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let imagePath = await this.firebaseSvc.getFilePath(product.image);
    await this.firebaseSvc.deleteFile(imagePath);

    this.firebaseSvc.deleteDocument(path).then(async res => {

      this.products = this.products.filter(p => p.id !== product.id);

      this.utilsSvc.presentToast({
        message: 'Producto eliminado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      })

    }).catch(error => {
      console.log(error);

      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      })

    }).finally(() => {
      loading.dismiss();
    })


  }
}
