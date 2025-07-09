Get address details​#Copy link
The endpoint to get address details.

Eligible For	Free Trial and Paid users
Cost	50 Credit Units
Query Parameters
chain_id
Type:string
enum
required
Example
Chain ID

pacific-1
atlantic-2
arctic-1
address
Type:string
required
Example
Wallet address (EVM or Sei address)

Responses

200
Return address details

application/json
400
Bad request - invalid params

401
Unauthorized

403
Forbidden

404
Not found

Request Example for
get
/api/v2/addresses
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://seitrace.com/insights/api/v2/addresses?chain_id=pacific-1&address=seiabcxyuz' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get /api/v2/addresses)
Status:200
Status:400
Status:401
Status:403
Status:404
Copy content
{
  "operator_address": null,
  "consensus_hex_address": null,
  "coin_balance": "string",
  "raw_wei_balance": "string",
  "raw_usei_balance": "string",
  "hash": "string",
  "creation_tx_hash": null,
  "creator_address_hash": null,
  "is_contract": true,
  "association": {
    "evm_hash": "string",
    "sei_hash": "string",
    "timestamp": "string",
    "tx_hash": "string",
    "type": "string"
  }
}
Return address details

Get address transactions​#Copy link
The endpoint to get address transactions.

Eligible For	Free Trial and Paid users
Cost	100 Credit Units
Query Parameters
limit
Type:number
max: 
50
Example
Limit of items to be returned, capped at 50

offset
Type:number
max: 
500000
Example
Offset

chain_id
Type:string
enum
required
Example
Chain ID

pacific-1
atlantic-2
arctic-1
address
Type:string
required
Example
Wallet address (EVM or Sei address)

from_date
Type:string
Example
From date

to_date
Type:string
Example
To date

status
Type:string
enum
required
Example
Transaction status

ALL
SUCCESS
ERROR
Responses

200
Return address transactions list

application/json
400
Bad request - invalid params

401
Unauthorized

403
Forbidden

404
Not found

Request Example for
get
/api/v2/addresses/transactions
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://seitrace.com/insights/api/v2/addresses/transactions?chain_id=pacific-1&address=seiabcxyuz&status=ALL' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get /api/v2/addresses/transactions)
Status:200
Status:400
Status:401
Status:403
Status:404
Copy content
{
  "items": [
    {
      "priority_fee": "string",
      "tx_burnt_fee": "string",
      "raw_input": "string",
      "result": "string",
      "hash": "string",
      "max_fee_per_gas": "string",
      "revert_reason": {},
      "confirmation_duration": {},
      "confirmations": 1,
      "position": 1,
      "max_priority_fee_per_gas": "string",
      "created_contract": {},
      "value": "string",
      "tx_types": {},
      "from": {
        "ens_domain_name": "string",
        "hash": "string",
        "implementations": {},
        "is_contract": true,
        "is_scam": true,
        "is_verified": true,
        "metadata": {},
        "name": "string",
        "private_tags": {},
        "proxy_type": {},
        "public_tags": {},
        "watchlist_names": {}
      },
      "to": {
        "ens_domain_name": "string",
        "hash": "string",
        "implementations": {},
        "is_contract": true,
        "is_scam": true,
        "is_verified": true,
        "metadata": {},
        "name": "string",
        "private_tags": {},
        "proxy_type": {},
        "public_tags": {},
        "watchlist_names": {}
      },
      "gas_used": "string",
      "status": "string",
      "authorization_list": {},
      "method": "string",
      "fee": {},
      "actions": {},
      "gas_limit": "string",
      "gas_price": "string",
      "decoded_input": {},
      "base_fee_per_gas": "string",
      "timestamp": "2025-07-09T03:34:52.368Z",
      "nonce": 1,
      "block": 1,
      "transaction_types": {},
      "block_number": 1,
      "signers": {},
      "memo": "string"
    }
  ],
  "next_page_params": {
    "address": "string",
    "from_date": "string",
    "to_date": "string",
    "status": "string",
    "limit": 1,
    "offset": 1,
    "chain_id": "pacific-1"
  }
}


Get address token transfers​#Copy link
The endpoint to get address token transfers.

Eligible For	Free Trial and Paid users
Cost	100 Credit Units
Query Parameters
limit
Type:number
max: 
50
Example
Limit of items to be returned, capped at 50

offset
Type:number
max: 
500000
Example
Offset

chain_id
Type:string
enum
required
Example
Chain ID

pacific-1
atlantic-2
arctic-1
address
Type:string
required
Example
Wallet address (EVM or Sei address)

from_date
Type:string
Example
From date

to_date
Type:string
Example
To date

Responses

200
Return address token transfers list

application/json
400
Bad request - invalid params

401
Unauthorized

403
Forbidden

404
Not found

Request Example for
get
/api/v2/addresses/token-transfers
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://seitrace.com/insights/api/v2/addresses/token-transfers?chain_id=pacific-1&address=seiabcxyuz' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get /api/v2/addresses/token-transfers)
Status:200
Status:400
Status:401
Status:403
Status:404
Copy content
{
  "items": [
    {
      "amount": "string",
      "token_usd_price": null,
      "total_usd_value": null,
      "from": {
        "address_hash": "string",
        "address_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        }
      },
      "to": {
        "address_hash": "string",
        "address_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        }
      },
      "timestamp": "string",
      "raw_amount": "string",
      "tx_hash": "string",
      "action": "string",
      "block_height": "string",
      "token_info": {
        "token_contract": null,
        "token_denom": null,
        "token_symbol": "string",
        "token_name": "string",
        "token_id": "string",
        "token_logo": null,
        "token_decimals": "string",
        "token_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        },
        "token_type": "string"
      },
      "token_id": "string",
      "token_instance": {
        "token_contract": "string",
        "token_symbol": "string",
        "token_name": "string",
        "token_id": "string",
        "token_logo": null,
        "token_decimals": "string",
        "token_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        },
        "token_metadata": null
      }
    }
  ],
  "next_page_params": {
    "address": "string",
    "from_date": "string",
    "to_date": "string",
    "limit": 1,
    "offset": 1,
    "chain_id": "pacific-1"
  }
}




ERC20 Tokens ​#Copy link
ERC20 TokensOperations
get
/api/v2/token/erc20
get
/api/v2/token/erc20/balances
get
/api/v2/token/erc20/transfers
get
/api/v2/token/erc20/holders



Get Erc20 token info​#Copy link
The endpoint to get Erc20 token info.

Eligible For	Free Trial and Paid users
Cost	50 Credit Units
Query Parameters
chain_id
Type:string
enum
required
Example
Chain ID

pacific-1
atlantic-2
arctic-1
contract_address
Type:string
required
Example
Contract address

Responses

200
Return Erc20 token info

application/json
400
Bad request - invalid params

401
Unauthorized

403
Forbidden

404
Not found

Request Example for
get
/api/v2/token/erc20
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://seitrace.com/insights/api/v2/token/erc20?chain_id=pacific-1&contract_address=0x0c78d371EB4F8c082E8CD23c2Fa321b915E1BBfA' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get /api/v2/token/erc20)
Status:200
Status:400
Status:401
Status:403
Status:404
Copy content
{
  "token_holder_count": "string",
  "token_raw_total_supply": "string",
  "token_total_supply": "string",
  "token_usd_price": null,
  "total_usd_value": null,
  "token_contract_address": "string",
  "token_symbol": "string",
  "token_name": "string",
  "token_decimals": "string",
  "token_description": null,
  "token_type": "ERC-721",
  "token_logo": null,
  "token_metadata": null,
  "token_association": {
    "evm_hash": "string",
    "sei_hash": "string",
    "timestamp": "2025-07-09T03:34:52.368Z",
    "tx_hash": "string",
    "type": "EOA"
  }
}



Get Erc20 token balances​#Copy link
The endpoint to get Erc20 token balances.

Eligible For	Free Trial and Paid users
Cost	50 Credit Units
Query Parameters
limit
Type:number
max: 
50
Example
Limit of items to be returned, capped at 50

offset
Type:number
max: 
500000
Example
Offset

chain_id
Type:string
enum
required
Example
Chain ID

pacific-1
atlantic-2
arctic-1
address
Type:string
required
Example
Wallet address

token_contract_list
Type:array string[]
Example
List of token contract addresses

Responses

200
Return Erc20 tokens in a wallet address

application/json
400
Bad request - invalid params

401
Unauthorized

403
Forbidden

404
Not found

Request Example for
get
/api/v2/token/erc20/balances
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://seitrace.com/insights/api/v2/token/erc20/balances?chain_id=pacific-1&address=0x0c78d371EB4F8c082E8CD23c2Fa321b915E1BBfA' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get /api/v2/token/erc20/balances)
Status:200
Status:400
Status:401
Status:403
Status:404
Copy content
{
  "items": [
    {
      "raw_amount": "string",
      "amount": "string",
      "token_usd_price": null,
      "total_usd_value": null,
      "wallet_address": {
        "address_hash": "string",
        "address_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        }
      },
      "token_contract": "string",
      "token_symbol": "string",
      "token_name": "string",
      "token_decimals": "string",
      "token_logo": "string",
      "token_type": "string",
      "token_association": {
        "evm_hash": "string",
        "sei_hash": "string",
        "timestamp": "2025-07-09T03:34:52.368Z",
        "tx_hash": "string",
        "type": "EOA"
      }
    }
  ],
  "next_page_params": {
    "address": "string",
    "token_contract_list": [
      "string"
    ],
    "limit": 1,
    "offset": 1,
    "chain_id": "pacific-1"
  }
}



Get Erc20 token transfers​#Copy link
The endpoint to get Erc20 token transfers. Sorted by time in descending order.

Eligible For	Free Trial and Paid users
Cost	100 Credit Units
Query Parameters
limit
Type:number
max: 
50
Example
Limit of items to be returned, capped at 50

offset
Type:number
max: 
500000
Example
Offset

chain_id
Type:string
enum
required
Example
Chain ID

pacific-1
atlantic-2
arctic-1
contract_address
Type:string
required
Example
Contract address

wallet_address
Type:string
Example
Wallet address

from_date
Type:string
Example
From date

to_date
Type:string
Example
To date

Responses

200
Return Erc20 tokens in a wallet address

application/json
400
Bad request - invalid params

401
Unauthorized

403
Forbidden

404
Not found

Request Example for
get
/api/v2/token/erc20/transfers
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://seitrace.com/insights/api/v2/token/erc20/transfers?chain_id=pacific-1&contract_address=0x0c78d371EB4F8c082E8CD23c2Fa321b915E1BBfA' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get /api/v2/token/erc20/transfers)
Status:200
Status:400
Status:401
Status:403
Status:404
Copy content
{
  "items": [
    {
      "amount": "string",
      "token_usd_price": null,
      "total_usd_value": null,
      "from": {
        "address_hash": "string",
        "address_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        }
      },
      "to": {
        "address_hash": "string",
        "address_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        }
      },
      "timestamp": "string",
      "raw_amount": "string",
      "tx_hash": "string",
      "action": "string",
      "block_height": "string",
      "token_info": {
        "token_contract": "string",
        "token_symbol": "string",
        "token_name": "string",
        "token_id": "string",
        "token_logo": null,
        "token_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        }
      }
    }
  ],
  "next_page_params": {
    "contract_address": "string",
    "wallet_address": "string",
    "from_date": "string",
    "to_date": "string",
    "limit": 1,
    "offset": 1,
    "chain_id": "pacific-1"
  }
}



Get Erc20 token holders​#Copy link
The endpoint to get Erc20 token holders. Sorted by amount in descending order.

Eligible For	Paid users
Cost	100 Credit Units
Query Parameters
limit
Type:number
max: 
50
Example
Limit of items to be returned, capped at 50

offset
Type:number
max: 
500000
Example
Offset

chain_id
Type:string
enum
required
Example
Chain ID

pacific-1
atlantic-2
arctic-1
contract_address
Type:string
required
Example
Contract address

Responses

200
Return Erc20 token holders

application/json
400
Bad request - invalid params

401
Unauthorized

403
Forbidden

404
Not found

Request Example for
get
/api/v2/token/erc20/holders
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://seitrace.com/insights/api/v2/token/erc20/holders?chain_id=pacific-1&contract_address=0x0c78d371EB4F8c082E8CD23c2Fa321b915E1BBfA' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get /api/v2/token/erc20/holders)
Status:200
Status:400
Status:401
Status:403
Status:404
Copy content
{
  "items": [
    {
      "wallet_address": {
        "address_hash": "string",
        "address_association": {
          "evm_hash": "string",
          "sei_hash": "string",
          "timestamp": "2025-07-09T03:34:52.368Z",
          "tx_hash": "string",
          "type": "EOA"
        }
      },
      "raw_amount": "string",
      "amount": "string",
      "token_usd_price": null,
      "total_usd_value": null,
      "token_contract": "string",
      "token_symbol": "string",
      "token_name": "string",
      "token_decimals": "string",
      "token_logo": "string",
      "token_type": "string",
      "token_association": {
        "evm_hash": "string",
        "sei_hash": "string",
        "timestamp": "2025-07-09T03:34:52.368Z",
        "tx_hash": "string",
        "type": "EOA"
      }
    }
  ],
  "next_page_params": {
    "contract_address": "string",
    "limit": 1,
    "offset": 1,
    "chain_id": "pacific-1"
  }
}
Return Erc20 token holders