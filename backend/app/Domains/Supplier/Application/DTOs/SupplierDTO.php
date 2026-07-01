<?php

namespace App\Domains\Supplier\Application\DTOs;

class SupplierDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?string $contactPerson,
        public readonly ?string $email,
        public readonly ?string $phone,
        public readonly ?string $viber,
        public readonly ?string $address,
        public readonly ?string $supplierCode = null
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            contactPerson: $data['contactPerson'] ?? null,
            email: $data['email'] ?? null,
            phone: $data['phone'] ?? null,
            viber: $data['viber'] ?? null,
            address: $data['address'] ?? null,
            supplierCode: $data['supplierCode'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'CompanyName' => $this->name,
            'CompanyContact' => $this->contactPerson,
            'Email' => $this->email,
            'ContactNumber' => $this->phone,
            'Viber' => $this->viber,
            'address' => $this->address,
        ];
    }
}
