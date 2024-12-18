/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/open_dialogue_dapp.json`.
 */
export type OpenDialogueDapp = {
  "address": "9fPsvWHnM6BUsYhYMgsTKZe7nbpcjmuMygA9cMCEJmtc",
  "metadata": {
    "name": "openDialogueDapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closeChannel",
      "discriminator": [
        0,
        104,
        36,
        1,
        66,
        0,
        103,
        157
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "channel",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "createChannel",
      "discriminator": [
        37,
        105,
        253,
        99,
        87,
        46,
        223,
        20
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "author",
          "writable": true,
          "signer": true
        },
        {
          "name": "subject",
          "docs": [
            "The subject account this channel is about"
          ]
        },
        {
          "name": "channel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  110,
                  110,
                  101,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "subject"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createPost",
      "discriminator": [
        123,
        92,
        184,
        29,
        231,
        24,
        15,
        202
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true,
          "signer": true
        },
        {
          "name": "channel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  110,
                  110,
                  101,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "channel.subject",
                "account": "channel"
              }
            ]
          }
        },
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "channel.subject",
                "account": "channel"
              },
              {
                "kind": "account",
                "path": "channel.posts",
                "account": "channel"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "channel",
      "discriminator": [
        49,
        159,
        99,
        106,
        220,
        87,
        219,
        88
      ]
    },
    {
      "name": "post",
      "discriminator": [
        8,
        147,
        90,
        186,
        185,
        56,
        192,
        150
      ]
    },
    {
      "name": "state",
      "discriminator": [
        216,
        146,
        107,
        94,
        104,
        75,
        182,
        177
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "noChannelAvailable",
      "msg": "noChannelAvailable"
    },
    {
      "code": 6001,
      "name": "contentTooLong",
      "msg": "Content must be 128 characters or less"
    },
    {
      "code": 6002,
      "name": "maximumPostsReached",
      "msg": "Channel has reached maximum of 50 posts"
    }
  ],
  "types": [
    {
      "name": "channel",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "posts",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "postCount",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "author",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "channels",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
