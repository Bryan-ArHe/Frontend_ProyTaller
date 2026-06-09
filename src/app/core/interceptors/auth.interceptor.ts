import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // 🌟 En interceptores funcionales usamos inject() directo
  const token = sessionStorage.getItem('access_token') || 
                localStorage.getItem('access_token') || 
                localStorage.getItem('token');
  
  let cloned = req;
  if (token) {
    cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        const errorDetail = error.error?.detail || '';
        // 🌟 Solo redirigir si es una expulsión explícita por token inválido o Tenant inactivo
        if (
          errorDetail.includes('INACTIVA') || 
          errorDetail.includes('expirado') || 
          errorDetail.includes('Signature has expired')
        ) {
          sessionStorage.clear();
          localStorage.clear();
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    })
  );
};