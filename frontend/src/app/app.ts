import { Component, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { keycloak } from '../main';

@Component({
    selector: 'app-root',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App implements OnInit {
    // Signals για τη διαχείριση της κατάστασης (State)
    name = signal('stranger');
    userId = signal('');
    connections = signal<{ id: string; permissionId: string; status: string }[]>([]);

    ngOnInit() {
        // 1. Καλούμε το /api/me για να πάρουμε όνομα και User ID
        fetch('http://localhost:8082/api/me', {
            headers: {
                Authorization: `Bearer ${keycloak.token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                this.name.set(data.name);
                this.userId.set(data.id);

                // 2. Μόλις πάρουμε τα στοιχεία, φορτώνουμε τις υπάρχουσες συνδέσεις
                void this.updateConnections();
            })
            .catch((err) => console.error(err));
    }

    // Φέρνει τις συνδέσεις του χρήστη από το Backend
    async updateConnections() {
        const response = await fetch('http://localhost:8082/api/connections', {
            headers: {
                Authorization: `Bearer ${keycloak.token}`,
            },
        });

        const data = await response.json();

        // Ενημερώνουμε το reactive signal των συνδέσεων
        this.connections.set(data);
    }
}